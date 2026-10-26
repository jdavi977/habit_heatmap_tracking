-- =====================================================================
-- RLS test script: Harada heatmap app
-- Pretends to be two signed-in users (A and B) and one signed-out
-- visitor, then checks that nobody can touch anyone else's data.
--
-- HOW TO RUN (dev project only, never production):
--   psql:  psql "<your connection string>" -v ON_ERROR_STOP=1 -f rls_tests.sql
--   or paste into the Supabase SQL editor.
--
-- HOW TO READ THE RESULT:
--   * Any failure stops the script with an error starting with "FAIL [id]".
--   * If the script finishes with no FAIL, everything passed.
--   * In psql you also see a "PASS [id]" notice per check.
--   * Everything runs inside a transaction that is rolled back at the
--     end, so no test data is left behind.
--
-- BEFORE RUNNING, check the lines marked ADJUST. I don't know your
-- column types for frequency, difficulty and completion.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- SEED DATA (runs as the admin role, which bypasses RLS)
-- Ids use hex digits only so they are valid uuids:
--   user A = aaaaaaaa..., user B = bbbbbbbb..., stranger = cccccccc...
--   a1.. = season, a2.. = goal, a3.. = pillar, a4.. = action,
--   a5.. = completion (b1.. to b5.. are the same for user B)
-- ---------------------------------------------------------------------

-- If this insert errors, create two users in Dashboard > Authentication
-- and find/replace the aaaaaaaa.. and bbbbbbbb.. uuids in this file.
insert into auth.users (id, aud, role, email) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'rls-test-a@example.test'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'authenticated', 'authenticated', 'rls-test-b@example.test');

-- "on conflict do nothing" covers the case where a signup trigger
-- already created the profile rows.
insert into public.profiles (id, display_name, timezone, account_creation) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Test A', 'UTC', now()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Test B', 'UTC', now())
on conflict (id) do nothing;

insert into public.seasons (id, user_id, name, start_date, end_date, created_at) values
  ('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Season A', current_date, current_date + 90, now()),
  ('b1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Season B', current_date, current_date + 90, now());

insert into public.lead_goals (id, season_id, title, center_statement, completed_at) values
  ('a2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Goal A', 'Center A', null),
  ('b2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'Goal B', 'Center B', null);

insert into public.pillars (id, goal_id, title) values
  ('a3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'Pillar A'),
  ('b3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222', 'Pillar B');

-- ADJUST: 'daily' and 'easy' are guesses for frequency and difficulty.
insert into public.actions (id, pillar_id, title, start_date, frequency, difficulty) values
  ('a4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 'Action A', current_date, 'daily', 'easy'),
  ('b4444444-4444-4444-4444-444444444444', 'b3333333-3333-3333-3333-333333333333', 'Action B', current_date, 'daily', 'easy');

-- ADJUST: 'true' is a guess for the completion column type.
insert into public.action_completion (id, action_id, completion, completed_at) values
  ('a5555555-5555-5555-5555-555555555555', 'a4444444-4444-4444-4444-444444444444', true, now()),
  ('b5555555-5555-5555-5555-555555555555', 'b4444444-4444-4444-4444-444444444444', true, now());


-- =====================================================================
-- TEST GROUP 1: READS
-- Each user must see exactly 1 of their own rows per table and 0 of the
-- other user's. Failed reads don't error, they silently return nothing.
-- =====================================================================
do $$
declare
  t record;
  n int;
begin
  set local role authenticated;

  for t in
    select * from (values
      -- acting user,                              table,               own id,                                   other user's id
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'profiles',          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'seasons',           'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111'),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'lead_goals',        'a2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222'),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pillars',           'a3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333'),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'actions',           'a4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444'),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'action_completion', 'a5555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555'),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'profiles',          'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'seasons',           'b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'lead_goals',        'b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pillars',           'b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333'),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'actions',           'b4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444'),
      ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'action_completion', 'b5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555')
    ) as v(uid, tbl, own_id, other_id)
  loop
    -- Pretend to be this user (this is what auth.uid() reads).
    perform set_config('request.jwt.claims',
      json_build_object('sub', t.uid, 'role', 'authenticated')::text, true);
    perform set_config('request.jwt.claim.sub', t.uid, true);

    execute format('select count(*) from public.%I where id = %L', t.tbl, t.own_id) into n;
    if n <> 1 then
      raise exception 'FAIL [1-own]: user % cannot read own row in % (saw % rows)', left(t.uid, 2), t.tbl, n;
    end if;

    execute format('select count(*) from public.%I where id = %L', t.tbl, t.other_id) into n;
    if n <> 0 then
      raise exception 'FAIL [1-other]: user % can read ANOTHER user''s row in % (saw % rows)', left(t.uid, 2), t.tbl, n;
    end if;

    raise notice 'PASS [1]: reads isolated for % on %', left(t.uid, 2), t.tbl;
  end loop;

  reset role;
end $$;


-- =====================================================================
-- TEST GROUP 2: FORBIDDEN WRITES (user A attacks user B)
-- These should raise a "row-level security" error. We check the error
-- text too, because a plain "permission denied for table" error would
-- have the same error code but mean something different.
-- =====================================================================
do $$
declare
  m text;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
  set local role authenticated;

  -- 2a: create a season that belongs to B
  begin
    insert into public.seasons (id, user_id, name, start_date, end_date, created_at)
    values (gen_random_uuid(), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Evil', current_date, current_date + 1, now());
    raise exception 'FAIL [2a]: A created a season owned by B';
  exception when insufficient_privilege then
    get stacked diagnostics m = message_text;
    if m not like '%row-level security%' then raise exception 'FAIL [2a]: blocked for the wrong reason: %', m; end if;
    raise notice 'PASS [2a]: cannot create a season for another user';
  end;

  -- 2b: add a goal to B's season
  begin
    insert into public.lead_goals (id, season_id, title, center_statement, completed_at)
    values (gen_random_uuid(), 'b1111111-1111-1111-1111-111111111111', 'Evil', 'Evil', null);
    raise exception 'FAIL [2b]: A added a goal to B''s season';
  exception when insufficient_privilege then
    get stacked diagnostics m = message_text;
    if m not like '%row-level security%' then raise exception 'FAIL [2b]: blocked for the wrong reason: %', m; end if;
    raise notice 'PASS [2b]: cannot add a goal to another user''s season';
  end;

  -- 2c: add a pillar to B's goal
  begin
    insert into public.pillars (id, goal_id, title)
    values (gen_random_uuid(), 'b2222222-2222-2222-2222-222222222222', 'Evil');
    raise exception 'FAIL [2c]: A added a pillar to B''s goal';
  exception when insufficient_privilege then
    get stacked diagnostics m = message_text;
    if m not like '%row-level security%' then raise exception 'FAIL [2c]: blocked for the wrong reason: %', m; end if;
    raise notice 'PASS [2c]: cannot add a pillar to another user''s goal';
  end;

  -- 2d: add an action to B's pillar (ADJUST frequency/difficulty if needed)
  begin
    insert into public.actions (id, pillar_id, title, start_date, frequency, difficulty)
    values (gen_random_uuid(), 'b3333333-3333-3333-3333-333333333333', 'Evil', current_date, 'daily', 'easy');
    raise exception 'FAIL [2d]: A added an action to B''s pillar';
  exception when insufficient_privilege then
    get stacked diagnostics m = message_text;
    if m not like '%row-level security%' then raise exception 'FAIL [2d]: blocked for the wrong reason: %', m; end if;
    raise notice 'PASS [2d]: cannot add an action to another user''s pillar';
  end;

  -- 2e: log a completion against B's action (ADJUST completion value if needed)
  begin
    insert into public.action_completion (id, action_id, completion, completed_at)
    values (gen_random_uuid(), 'b4444444-4444-4444-4444-444444444444', true, now());
    raise exception 'FAIL [2e]: A logged a completion on B''s action';
  exception when insufficient_privilege then
    get stacked diagnostics m = message_text;
    if m not like '%row-level security%' then raise exception 'FAIL [2e]: blocked for the wrong reason: %', m; end if;
    raise notice 'PASS [2e]: cannot log a completion on another user''s action';
  end;

  -- 2f: create a profile for somebody else's id
  begin
    insert into public.profiles (id, display_name, timezone, account_creation)
    values ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Evil', 'UTC', now());
    raise exception 'FAIL [2f]: A created a profile for another id';
  exception when insufficient_privilege then
    get stacked diagnostics m = message_text;
    if m not like '%row-level security%' then raise exception 'FAIL [2f]: blocked for the wrong reason: %', m; end if;
    raise notice 'PASS [2f]: cannot create a profile for another user';
  end;

  -- 2g: UPDATE trick. A owns this goal, but tries to move it into B's
  -- season. USING passes (A owns the old row); WITH CHECK must reject.
  begin
    update public.lead_goals
       set season_id = 'b1111111-1111-1111-1111-111111111111'
     where id = 'a2222222-2222-2222-2222-222222222222';
    raise exception 'FAIL [2g]: A moved own goal into B''s season';
  exception when insufficient_privilege then
    get stacked diagnostics m = message_text;
    if m not like '%row-level security%' then raise exception 'FAIL [2g]: blocked for the wrong reason: %', m; end if;
    raise notice 'PASS [2g]: WITH CHECK stops moving a goal into another user''s season';
  end;

  -- 2h: same trick one level deeper: move own action into B's pillar
  begin
    update public.actions
       set pillar_id = 'b3333333-3333-3333-3333-333333333333'
     where id = 'a4444444-4444-4444-4444-444444444444';
    raise exception 'FAIL [2h]: A moved own action into B''s pillar';
  exception when insufficient_privilege then
    get stacked diagnostics m = message_text;
    if m not like '%row-level security%' then raise exception 'FAIL [2h]: blocked for the wrong reason: %', m; end if;
    raise notice 'PASS [2h]: WITH CHECK stops moving an action into another user''s pillar';
  end;

  reset role;
end $$;


-- =====================================================================
-- TEST GROUP 3: HIDDEN WRITES (A tries to change or delete B's rows)
-- These DON'T raise errors. The policy hides B's rows, so the command
-- just affects 0 rows. We check the count AND that B's data is intact.
-- =====================================================================
do $$
declare
  n int;
  title_now text;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
  set local role authenticated;

  update public.lead_goals set title = 'hacked' where id = 'b2222222-2222-2222-2222-222222222222';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL [3a]: A updated % of B''s goals', n; end if;

  update public.profiles set display_name = 'hacked' where id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL [3b]: A updated B''s profile'; end if;

  update public.action_completion set completed_at = now() - interval '1 year'
   where id = 'b5555555-5555-5555-5555-555555555555';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL [3c]: A updated B''s completion'; end if;

  delete from public.actions where id = 'b4444444-4444-4444-4444-444444444444';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL [3d]: A deleted B''s action'; end if;

  delete from public.seasons where id = 'b1111111-1111-1111-1111-111111111111';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL [3e]: A deleted B''s season'; end if;

  -- Back to the admin role to confirm B's data really is untouched.
  reset role;

  select title into title_now from public.lead_goals where id = 'b2222222-2222-2222-2222-222222222222';
  if title_now is distinct from 'Goal B' then raise exception 'FAIL [3f]: B''s goal title changed to %', title_now; end if;

  if not exists (select 1 from public.actions where id = 'b4444444-4444-4444-4444-444444444444') then
    raise exception 'FAIL [3g]: B''s action is gone';
  end if;
  if not exists (select 1 from public.seasons where id = 'b1111111-1111-1111-1111-111111111111') then
    raise exception 'FAIL [3h]: B''s season is gone';
  end if;

  raise notice 'PASS [3]: A''s attempts to change or delete B''s rows had no effect';
end $$;


-- =====================================================================
-- TEST GROUP 4: LEGITIMATE WRITES (A works on their own data)
-- A policy set that blocks everything would pass groups 1 to 3, so we
-- also prove the app can still do its job.
-- =====================================================================
do $$
declare
  n int;
  new_action uuid := gen_random_uuid();
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);
  set local role authenticated;

  -- 4a: add an action to own pillar (ADJUST frequency/difficulty if needed)
  insert into public.actions (id, pillar_id, title, start_date, frequency, difficulty)
  values (new_action, 'a3333333-3333-3333-3333-333333333333', 'New action', current_date, 'daily', 'easy');

  -- 4b: log a completion for it (ADJUST completion value if needed)
  insert into public.action_completion (id, action_id, completion, completed_at)
  values (gen_random_uuid(), new_action, true, now());

  -- 4c: edit own goal
  update public.lead_goals set title = 'Goal A (edited)' where id = 'a2222222-2222-2222-2222-222222222222';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL [4c]: A cannot edit own goal'; end if;

  -- 4d: edit own profile
  update public.profiles set display_name = 'Test A (edited)' where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL [4d]: A cannot edit own profile'; end if;

  -- 4e: delete own completion
  delete from public.action_completion where action_id = new_action;
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL [4e]: A cannot delete own completion'; end if;

  raise notice 'PASS [4]: A can still create, edit and delete own data';
  reset role;
end $$;


-- =====================================================================
-- TEST GROUP 5: SIGNED-OUT VISITOR (anon role)
-- Either "0 rows" or "no access at all" is acceptable. Seeing any row,
-- or running the private helper functions, is a failure.
-- =====================================================================
do $$
declare
  t text;
  n int;
begin
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  set local role anon;

  foreach t in array array['profiles', 'seasons', 'lead_goals', 'pillars', 'actions', 'action_completion']
  loop
    begin
      execute format('select count(*) from public.%I', t) into n;
      if n <> 0 then raise exception 'FAIL [5a]: signed-out visitor can read % rows in %', n, t; end if;
    exception when insufficient_privilege then
      null;  -- no access at all is also fine
    end;
  end loop;
  raise notice 'PASS [5a]: signed-out visitor sees no data';

  begin
    perform private.owns_season('a1111111-1111-1111-1111-111111111111');
    raise exception 'FAIL [5b]: signed-out visitor can call a private helper function';
  exception when insufficient_privilege then
    raise notice 'PASS [5b]: private helper functions are not callable when signed out';
  end;

  reset role;
end $$;


-- All tests passed if you got here. Undo all the test data.
rollback;
