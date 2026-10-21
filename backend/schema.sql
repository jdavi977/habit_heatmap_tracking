-- Tables for the habit heatmap tracker. Run this before seed.sql.
-- auth.users is managed by Supabase; everything here lives in public.
-- Safe to re-run: drops and recreates everything below, which deletes existing rows.

BEGIN;

DROP TABLE IF EXISTS public.action_completion, public.actions, public.pillars,
  public.lead_goals, public.seasons, public.profiles CASCADE;
DROP TYPE IF EXISTS public.frequency, public.difficulty, public.priority CASCADE;

-- monthly also covers one-time actions.
CREATE TYPE public.frequency  AS ENUM ('daily', 'weekly', 'monthly');
CREATE TYPE public.difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.priority   AS ENUM ('low', 'medium', 'high');

-- One profile per auth user, sharing the same id.
CREATE TABLE public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  timezone     text DEFAULT 'America/Toronto',
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE public.seasons (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name       text NOT NULL,
  start_date date NOT NULL,
  end_date   date NOT NULL,
  created_at timestamptz DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE TABLE public.lead_goals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id        uuid NOT NULL REFERENCES public.seasons (id) ON DELETE CASCADE,
  title            text NOT NULL,
  center_statement text,
  completed_at     timestamptz
);

CREATE TABLE public.pillars (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.lead_goals (id) ON DELETE CASCADE,
  title   text NOT NULL
);

CREATE TABLE public.actions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_id        uuid NOT NULL REFERENCES public.pillars (id) ON DELETE CASCADE,
  title            text NOT NULL,
  start_date       date NOT NULL,
  frequency        public.frequency NOT NULL,
  difficulty       public.difficulty NOT NULL
);

CREATE TABLE public.action_completion (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id    uuid NOT NULL REFERENCES public.actions (id) ON DELETE CASCADE,
  completion   boolean NOT NULL,
  completed_at timestamptz
);

-- Postgres doesn't index foreign key columns on its own.
CREATE INDEX seasons_user_id_idx      ON public.seasons (user_id);
CREATE INDEX lead_goals_season_id_idx ON public.lead_goals (season_id);
CREATE INDEX pillars_goal_id_idx      ON public.pillars (goal_id);
CREATE INDEX actions_pillar_id_idx    ON public.actions (pillar_id);
CREATE INDEX action_completion_action_id_idx ON public.action_completion (action_id);

COMMIT;
