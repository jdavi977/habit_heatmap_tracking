"""Generate fake seed data for 5 users.

Writes seed.sql (run against Supabase) and fake_data/fake_data.json (same rows, for local use).
UUIDs are derived with uuid5 and completions use a seeded RNG, so re-running produces identical output.

    python backend/generate.py
"""

import json
import random
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

OUT_DIR = Path(__file__).parent
NAMESPACE = uuid.UUID("6f1c2a4e-9b7d-4c3e-8a21-5d0f3e7b9c11")
PASSWORD = "password123"
TODAY = date(2026, 10, 20)

FREQ = {"D": "daily", "W": "weekly", "M": "monthly"}
DIFF = {"E": "easy", "M": "medium", "H": "hard"}
# Chance a period gets checked off, by difficulty.
HIT_RATE = {"E": 0.85, "M": 0.7, "H": 0.55}
PERIOD_DAYS = {"D": 1, "W": 7, "M": 30}


def uid(*parts):
    return str(uuid.uuid5(NAMESPACE, "/".join(str(p) for p in parts)))


# Each action is (title, frequency, difficulty).
USERS = [
    {
        "email": "maya.chen@example.com",
        "display_name": "Maya Chen",
        "timezone": "America/Toronto",
        "created_at": "2026-09-02T14:12:00+00:00",
        "season": ("Fall 2026", "2026-10-15", "2027-01-15"),
        "goal": {
            "title": "Land a full-time software job",
            "center_statement": "Signed full-time offer as a junior backend developer in Toronto by Jan 15, 2027.",
            "completed_at": None,
        },
        "pillars": {
            "Targeting": [
                ("Write a one-sentence job target", "M", "E"),
                ("Add 5 new companies to the list", "W", "E"),
                ("Check tier-1 careers pages", "W", "E"),
                ("Read job postings and list repeating skills", "M", "M"),
                ("Set up job alerts on 3 boards", "M", "E"),
                ("Find 3 people with my target job", "M", "M"),
                ("Review target based on response rate", "M", "M"),
                ("Research one company in depth", "W", "M"),
            ],
            "Resume and materials": [
                ("Finish one-page master resume", "M", "H"),
                ("Get resume reviewed by career centre", "M", "M"),
                ("Tailor resume to an application", "D", "M"),
                ("Update LinkedIn profile", "M", "M"),
                ("Write cover letter template", "M", "M"),
                ("Practice 30-second pitch out loud", "W", "E"),
                ("Track which resume version gets responses", "W", "E"),
                ("Refresh resume with new projects", "M", "E"),
            ],
            "Skills and portfolio": [
                ("Focused practice on weakest skill", "W", "H"),
                ("Finish portfolio project", "M", "H"),
                ("Write project README / case study", "M", "M"),
                ("Solve coding practice problems", "W", "H"),
                ("Post something I built on LinkedIn", "W", "M"),
                ("Get a project reviewed by a senior dev", "M", "M"),
                ("Complete a cloud fundamentals course", "M", "H"),
                ("Read one engineering blog post", "W", "E"),
            ],
            "Networking": [
                ("Send outreach messages", "W", "M"),
                ("Have a coffee chat", "W", "M"),
                ("Attend a career fair or meetup", "M", "M"),
                ("Ask professors for leads", "M", "E"),
                ("Follow up with new contacts within 48h", "D", "E"),
                ("Ask for a referral", "W", "H"),
                ("Update contact log", "W", "E"),
                ("Send thank-you notes", "D", "E"),
            ],
            "Applications": [
                ("Submit targeted applications", "W", "M"),
                ("Apply within 3 days of posting", "W", "M"),
                ("Log applications in tracker", "D", "E"),
                ("Follow up on week-old applications", "W", "E"),
                ("Apply to one stretch role", "W", "H"),
                ("Review rejection patterns", "M", "M"),
                ("Clear the application inbox", "D", "E"),
                ("Apply through a referral", "M", "M"),
            ],
            "Interview prep": [
                ("Mock technical interview", "W", "H"),
                ("Write STAR stories", "M", "M"),
                ("Practice behavioural answers out loud", "W", "M"),
                ("Review system design basics", "W", "H"),
                ("Prepare questions for interviewers", "M", "E"),
                ("Research company before each interview", "W", "E"),
                ("Debrief after each interview", "W", "E"),
                ("Record and review a mock answer", "M", "M"),
            ],
            "Boxing maintenance": [
                ("Boxing class", "W", "H"),
                ("Shadowboxing rounds", "W", "M"),
                ("Jump rope 10 minutes", "D", "E"),
                ("Stretch / mobility", "D", "E"),
                ("Easy run", "W", "M"),
                ("Strength session", "W", "H"),
                ("Film and review sparring", "M", "M"),
                ("Weigh in", "W", "E"),
            ],
            "School and health": [
                ("Attend all lectures", "D", "E"),
                ("Study block for finals", "W", "H"),
                ("Submit assignments on time", "W", "M"),
                ("Sleep by midnight", "D", "M"),
                ("Meal prep", "W", "M"),
                ("Walk outside 20 minutes", "D", "E"),
                ("Weekly review and plan", "W", "E"),
                ("Call family", "W", "E"),
            ],
        },
    },
    {
        "email": "diego.ramirez@example.com",
        "display_name": "Diego Ramirez",
        "timezone": "America/Mexico_City",
        "created_at": "2026-07-18T03:45:00+00:00",
        "season": ("Marathon Build", "2026-08-01", "2026-11-29"),
        "goal": {
            "title": "Run a sub-3:30 marathon",
            "center_statement": "Finish the Monterrey Marathon in under 3:30:00 on Nov 29, 2026.",
            "completed_at": None,
        },
        "pillars": {
            "Endurance": [
                ("Long run", "W", "H"),
                ("Easy run", "W", "E"),
                ("Back-to-back weekend runs", "M", "H"),
                ("Cross-train on the bike", "W", "M"),
                ("Track weekly mileage", "W", "E"),
                ("Run a half-marathon tune-up", "M", "H"),
                ("Easy recovery jog", "W", "E"),
                ("Hill repeats", "W", "H"),
            ],
            "Speed": [
                ("Interval session", "W", "H"),
                ("Tempo run", "W", "H"),
                ("Strides after easy runs", "W", "E"),
                ("Marathon-pace miles", "W", "M"),
                ("5K time trial", "M", "H"),
                ("Cadence drills", "W", "E"),
                ("Fartlek run", "W", "M"),
                ("Review splits after workouts", "W", "E"),
            ],
            "Strength": [
                ("Leg strength session", "W", "H"),
                ("Core circuit", "W", "M"),
                ("Single-leg balance work", "W", "E"),
                ("Glute activation before runs", "D", "E"),
                ("Plyometrics", "W", "M"),
                ("Upper body session", "W", "M"),
                ("Calf raises", "D", "E"),
                ("Hip mobility flow", "W", "E"),
            ],
            "Recovery": [
                ("Sleep 8 hours", "D", "M"),
                ("Foam roll", "D", "E"),
                ("Rest day with no running", "W", "E"),
                ("Massage or physio", "M", "M"),
                ("Ice bath after long run", "W", "M"),
                ("Log morning heart rate", "D", "E"),
                ("Stretch 15 minutes", "D", "E"),
                ("Deload week", "M", "E"),
            ],
            "Nutrition": [
                ("Hit protein target", "D", "M"),
                ("Drink 3L of water", "D", "E"),
                ("Practice race-day fuelling on long run", "W", "M"),
                ("Meal prep for the week", "W", "M"),
                ("No alcohol on weekdays", "D", "M"),
                ("Eat vegetables at two meals", "D", "E"),
                ("Test race breakfast", "M", "E"),
                ("Carb-load plan written", "M", "E"),
            ],
            "Gear and logistics": [
                ("Rotate running shoes", "W", "E"),
                ("Book race travel", "M", "E"),
                ("Test race outfit on a long run", "M", "E"),
                ("Charge watch and sync data", "D", "E"),
                ("Plan long run routes", "W", "E"),
                ("Buy gels for the block", "M", "E"),
                ("Check race course map", "M", "E"),
                ("Replace worn shoes", "M", "M"),
            ],
            "Mindset": [
                ("Visualise race day", "W", "E"),
                ("Write race mantra", "M", "E"),
                ("Journal after key workouts", "W", "E"),
                ("Run one workout without music", "W", "M"),
                ("Read running books", "W", "E"),
                ("Review training log for wins", "W", "E"),
                ("Meditate 10 minutes", "D", "M"),
                ("Join a group run", "M", "M"),
            ],
            "Work and life balance": [
                ("Block calendar for runs", "W", "E"),
                ("Leave work by 6pm", "D", "M"),
                ("Date night", "W", "E"),
                ("Screen off by 10pm", "D", "M"),
                ("Sunday planning session", "W", "E"),
                ("Call a friend", "W", "E"),
                ("Clean the apartment", "W", "E"),
                ("Budget review", "M", "E"),
            ],
        },
    },
    {
        "email": "aisha.okafor@example.com",
        "display_name": "Aisha Okafor",
        "timezone": "Europe/London",
        "created_at": "2026-05-10T09:30:00+00:00",
        "season": ("Summer Launch", "2026-06-01", "2026-09-30"),
        "goal": {
            "title": "Launch my ceramics shop",
            "center_statement": "Open an online ceramics shop and make 50 sales by Sep 30, 2026.",
            "completed_at": "2026-09-24T18:05:00+00:00",
        },
        "pillars": {
            "Product": [
                ("Throw pieces on the wheel", "W", "H"),
                ("Glaze firing", "W", "M"),
                ("Design a signature mug", "M", "H"),
                ("Test a new glaze", "W", "M"),
                ("Quality check finished pieces", "W", "E"),
                ("Sketch new designs", "W", "E"),
                ("Build stock to 30 pieces", "M", "H"),
                ("Clean the studio", "W", "E"),
            ],
            "Shop setup": [
                ("Choose shop platform", "M", "E"),
                ("Write product descriptions", "W", "M"),
                ("Set shipping rates", "M", "M"),
                ("Write returns policy", "M", "E"),
                ("Design logo", "M", "M"),
                ("Set up payments", "M", "M"),
                ("Order packaging", "M", "E"),
                ("Test checkout flow", "M", "E"),
            ],
            "Photography": [
                ("Photograph new pieces", "W", "M"),
                ("Edit product photos", "W", "M"),
                ("Build a light box", "M", "M"),
                ("Shoot lifestyle photos", "M", "M"),
                ("Film a process video", "W", "H"),
                ("Study product photography", "W", "E"),
                ("Reshoot weak listings", "M", "M"),
                ("Back up photo library", "W", "E"),
            ],
            "Marketing": [
                ("Post on Instagram", "W", "M"),
                ("Send newsletter", "W", "M"),
                ("Reply to comments and DMs", "D", "E"),
                ("Reach out to a local shop", "W", "H"),
                ("Run a launch giveaway", "M", "M"),
                ("Collaborate with a creator", "M", "H"),
                ("Review post analytics", "W", "E"),
                ("Run paid ads", "M", "M"),
            ],
            "Sales and markets": [
                ("Book a craft market stall", "M", "M"),
                ("Follow up with past buyers", "W", "E"),
                ("Ask buyers for reviews", "W", "E"),
                ("Pack and ship orders", "D", "M"),
                ("Create a gift bundle", "M", "M"),
                ("Offer custom commissions", "M", "H"),
                ("Track sales count", "W", "E"),
                ("Pitch wholesale to a cafe", "M", "H"),
            ],
            "Money": [
                ("Log expenses", "W", "E"),
                ("Price pieces using cost formula", "M", "M"),
                ("Set aside money for tax", "M", "E"),
                ("Review profit per piece", "M", "M"),
                ("Open business bank account", "M", "E"),
                ("Monthly budget review", "M", "E"),
                ("Save receipts", "W", "E"),
                ("Research grants", "M", "M"),
            ],
            "Learning": [
                ("Watch a pottery tutorial", "W", "E"),
                ("Take a glaze chemistry class", "M", "H"),
                ("Read about small business", "W", "E"),
                ("Visit a gallery", "M", "E"),
                ("Ask a mentor a question", "M", "M"),
                ("Join a makers forum", "M", "E"),
                ("Practice handbuilding", "W", "M"),
                ("Write lessons learned", "W", "E"),
            ],
            "Wellbeing": [
                ("Wrist and back stretches", "D", "E"),
                ("Yoga class", "W", "M"),
                ("Day off from the studio", "W", "E"),
                ("Walk in the park", "D", "E"),
                ("Sleep 7+ hours", "D", "M"),
                ("Cook dinner at home", "W", "E"),
                ("See friends", "W", "E"),
                ("Journal", "W", "E"),
            ],
        },
    },
    {
        "email": "kenji.watanabe@example.com",
        "display_name": "Kenji Watanabe",
        "timezone": "Asia/Tokyo",
        "created_at": "2026-09-20T22:10:00+00:00",
        "season": ("JLPT N2 Push", "2026-09-28", "2026-12-06"),
        "goal": {
            "title": "Pass JLPT N2",
            "center_statement": "Pass the JLPT N2 exam on Dec 6, 2026 with a score of 120 or higher.",
            "completed_at": None,
        },
        "pillars": {
            "Vocabulary": [
                ("Anki review", "D", "M"),
                ("Add 20 new words", "D", "M"),
                ("Review N2 word list section", "W", "M"),
                ("Write sentences with new words", "W", "M"),
                ("Clear leech cards", "W", "E"),
                ("Learn one set of synonyms", "W", "M"),
                ("Vocabulary self-test", "W", "E"),
                ("Review katakana loanwords", "W", "E"),
            ],
            "Kanji": [
                ("Learn 10 new kanji", "D", "H"),
                ("Handwrite kanji practice", "W", "M"),
                ("Kanji reading quiz", "W", "M"),
                ("Review radicals", "W", "E"),
                ("Read kanji in the wild and note them", "D", "E"),
                ("Monthly kanji test", "M", "H"),
                ("Review similar-looking kanji", "W", "M"),
                ("Kanji compound drill", "W", "M"),
            ],
            "Grammar": [
                ("Study 3 grammar points", "W", "H"),
                ("Grammar practice questions", "W", "M"),
                ("Review grammar notebook", "W", "E"),
                ("Write example sentences", "W", "M"),
                ("Ask tutor about confusing grammar", "W", "E"),
                ("Grammar mock section", "M", "H"),
                ("Compare similar grammar points", "W", "M"),
                ("Shadow grammar example audio", "W", "M"),
            ],
            "Reading": [
                ("Read an NHK Easy article", "D", "E"),
                ("Read a regular NHK article", "W", "H"),
                ("Timed reading practice", "W", "H"),
                ("Read a manga chapter", "W", "E"),
                ("Read a short story", "W", "M"),
                ("Summarise an article in Japanese", "W", "H"),
                ("Read N2 reading practice book", "W", "M"),
                ("Read a novel chapter", "W", "H"),
            ],
            "Listening": [
                ("Listen to a Japanese podcast", "D", "E"),
                ("N2 listening practice", "W", "H"),
                ("Shadowing practice", "W", "M"),
                ("Watch a drama episode without subs", "W", "H"),
                ("Dictation exercise", "W", "H"),
                ("Listen to news broadcast", "W", "M"),
                ("Rewatch with Japanese subs", "W", "E"),
                ("Note unknown words from audio", "W", "E"),
            ],
            "Practice tests": [
                ("Full mock exam", "M", "H"),
                ("Review mock exam mistakes", "M", "M"),
                ("Timed section drill", "W", "H"),
                ("Track score per section", "M", "E"),
                ("Practice answer sheet timing", "M", "E"),
                ("Book exam venue travel", "M", "E"),
                ("Redo missed questions", "W", "M"),
                ("Simulate exam morning", "M", "M"),
            ],
            "Speaking": [
                ("iTalki tutor session", "W", "H"),
                ("Language exchange meetup", "W", "M"),
                ("Talk to myself in Japanese", "D", "E"),
                ("Record a 2-minute monologue", "W", "M"),
                ("Order food in Japanese", "W", "E"),
                ("Message a Japanese friend", "W", "E"),
                ("Practice keigo phrases", "W", "M"),
                ("Join a Japanese Discord voice chat", "M", "M"),
            ],
            "Routine": [
                ("Study before work", "D", "M"),
                ("Phone in Japanese", "D", "E"),
                ("Weekly study plan", "W", "E"),
                ("Gym session", "W", "M"),
                ("Sleep by 11:30pm", "D", "M"),
                ("Tidy study desk", "W", "E"),
                ("Sunday rest from studying", "W", "E"),
                ("Review progress heatmap", "W", "E"),
            ],
        },
    },
    {
        "email": "sofia.rossi@example.com",
        "display_name": "Sofia Rossi",
        "timezone": "Europe/Rome",
        "created_at": "2026-08-25T07:55:00+00:00",
        "season": ("Autumn Reset", "2026-09-15", "2026-12-15"),
        "goal": {
            "title": "Get out of credit card debt",
            "center_statement": "Pay off the full €6,000 credit card balance by Dec 15, 2026 without new debt.",
            "completed_at": None,
        },
        "pillars": {
            "Budgeting": [
                ("Log every expense", "D", "E"),
                ("Weekly budget check-in", "W", "E"),
                ("Set monthly spending caps", "M", "M"),
                ("Review bank statement", "M", "M"),
                ("Use cash envelope for groceries", "W", "M"),
                ("Plan meals to budget", "W", "M"),
                ("Zero-based budget for next month", "M", "H"),
                ("Review categories that went over", "M", "E"),
            ],
            "Debt payments": [
                ("Make extra card payment", "W", "H"),
                ("Pay minimum on time", "M", "E"),
                ("Call bank to lower interest rate", "M", "H"),
                ("Track remaining balance", "W", "E"),
                ("Put windfalls toward debt", "M", "M"),
                ("Set up automatic payment", "M", "E"),
                ("Freeze card in the freezer", "M", "E"),
                ("Research balance transfer", "M", "M"),
            ],
            "Cutting costs": [
                ("Cancel one unused subscription", "M", "E"),
                ("No-spend day", "W", "M"),
                ("Cook instead of eating out", "W", "M"),
                ("Bring lunch to work", "W", "E"),
                ("Compare phone and internet plans", "M", "M"),
                ("Unsubscribe from shop emails", "M", "E"),
                ("Shop with a list only", "W", "E"),
                ("Wait 48h before non-essential buys", "D", "M"),
            ],
            "Extra income": [
                ("Freelance translation job", "W", "H"),
                ("Sell unused items online", "W", "M"),
                ("Ask for a raise", "M", "H"),
                ("Pitch a new freelance client", "W", "H"),
                ("Tutor Italian online", "W", "M"),
                ("Update freelance profile", "M", "E"),
                ("Track side income", "W", "E"),
                ("Pick up an extra shift", "M", "H"),
            ],
            "Emergency fund": [
                ("Transfer €20 to savings", "W", "M"),
                ("Open a separate savings account", "M", "E"),
                ("Round up purchases to savings", "D", "E"),
                ("Check emergency fund balance", "M", "E"),
                ("List true emergencies", "M", "E"),
                ("Save coin jar", "W", "E"),
                ("Move birthday money to savings", "M", "E"),
                ("Review insurance coverage", "M", "M"),
            ],
            "Money knowledge": [
                ("Read a personal finance chapter", "W", "E"),
                ("Listen to a money podcast", "W", "E"),
                ("Learn how card interest is calculated", "M", "M"),
                ("Check credit score", "M", "E"),
                ("Write down money beliefs", "M", "M"),
                ("Talk money with a friend", "M", "M"),
                ("Watch an investing basics video", "W", "E"),
                ("Plan post-debt savings goal", "M", "E"),
            ],
            "Social life on a budget": [
                ("Host a potluck", "M", "M"),
                ("Find free events", "W", "E"),
                ("Suggest cheap plans to friends", "W", "M"),
                ("Walk with a friend", "W", "E"),
                ("Library visit", "W", "E"),
                ("Say no to one expensive invite", "M", "H"),
                ("Game night at home", "M", "E"),
                ("Picnic instead of restaurant", "M", "E"),
            ],
            "Health": [
                ("Home workout", "W", "M"),
                ("Walk to work", "W", "E"),
                ("Sleep by 11pm", "D", "M"),
                ("Drink water before coffee", "D", "E"),
                ("Stretch before bed", "D", "E"),
                ("Meditate 5 minutes", "D", "E"),
                ("Cook a new healthy recipe", "W", "M"),
                ("Screen-free evening", "W", "M"),
            ],
        },
    },
]


def build():
    tables = {k: [] for k in ("users", "profiles", "seasons", "lead_goals", "pillars", "actions", "action_completion")}

    for u in USERS:
        user_id = uid("user", u["email"])
        tables["users"].append({"id": user_id, "email": u["email"], "created_at": u["created_at"]})
        tables["profiles"].append({
            "id": user_id,
            "display_name": u["display_name"],
            "timezone": u["timezone"],
            "created_at": u["created_at"],
        })

        name, start, end = u["season"]
        season_id = uid("season", user_id, name)
        # Season is created a few days before it starts.
        season_created = datetime.fromisoformat(start).replace(hour=12, tzinfo=timezone.utc) - timedelta(days=3)
        tables["seasons"].append({
            "id": season_id,
            "user_id": user_id,
            "name": name,
            "start_date": start,
            "end_date": end,
            "created_at": season_created.isoformat(),
        })

        goal_id = uid("goal", season_id)
        tables["lead_goals"].append({"id": goal_id, "season_id": season_id, **u["goal"]})

        # Most actions start with the season; every 4th is added a few weeks in,
        # capped at the season end and today.
        latest = min(date.fromisoformat(end), TODAY)
        for p_idx, (pillar_title, actions) in enumerate(u["pillars"].items()):
            pillar_id = uid("pillar", goal_id, pillar_title)
            tables["pillars"].append({"id": pillar_id, "goal_id": goal_id, "title": pillar_title})
            for a_idx, (title, freq, diff) in enumerate(actions):
                action_date = date.fromisoformat(start)
                if a_idx % 4 == 3:
                    action_date = min(action_date + timedelta(days=3 + (p_idx * 5 + a_idx) % 25), latest)
                action_id = uid("action", pillar_id, title)
                tables["actions"].append({
                    "id": action_id,
                    "pillar_id": pillar_id,
                    "title": title,
                    "start_date": action_date.isoformat(),
                    "frequency": FREQ[freq],
                    "difficulty": DIFF[diff],
                })
                tables["action_completion"] += completions(action_id, action_date, latest, freq, diff, u["timezone"])

    return tables


def completions(action_id, start, latest, freq, diff, tz):
    """One completed row per period that got checked off, from start through latest.

    Only completed rows are written: a missed period has no completed_at to place it on.
    """
    rng = random.Random(action_id)
    rows = []
    day = start
    while day <= latest:
        if rng.random() < HIT_RATE[diff]:
            # Checked off some evening within the period, in the user's local time.
            offset = rng.randrange(PERIOD_DAYS[freq])
            done_day = min(day + timedelta(days=offset), latest)
            local = datetime(done_day.year, done_day.month, done_day.day,
                             rng.randint(7, 22), rng.randrange(60), tzinfo=ZoneInfo(tz))
            rows.append({
                "id": uid("completion", action_id, day.isoformat()),
                "action_id": action_id,
                "completion": True,
                "completed_at": local.astimezone(timezone.utc).isoformat(),
            })
        day += timedelta(days=PERIOD_DAYS[freq])
    return rows


def sql_value(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, int):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def insert(table, rows, casts=None):
    casts = casts or {}
    cols = list(rows[0].keys())
    lines = []
    for r in rows:
        vals = []
        for c in cols:
            v = sql_value(r[c])
            if c in casts and r[c] is not None:
                v += "::" + casts[c]
            vals.append(v)
        lines.append("  (" + ", ".join(vals) + ")")
    return f"INSERT INTO {table} ({', '.join(cols)}) VALUES\n" + ",\n".join(lines) + "\nON CONFLICT (id) DO NOTHING;\n"


def write_sql(tables):
    out = [
        "-- Generated by backend/generate.py. Do not edit by hand.",
        f"-- 5 fake users, all with password '{PASSWORD}'.",
        "",
        "BEGIN;",
        "",
        "CREATE EXTENSION IF NOT EXISTS pgcrypto;",
        "",
        "-- auth.users needs the extra GoTrue columns filled in so these accounts can sign in.",
    ]
    user_rows = []
    for u in tables["users"]:
        user_rows.append(
            "  ('00000000-0000-0000-0000-000000000000', {id}, 'authenticated', 'authenticated', {email}, "
            "crypt('{pw}', gen_salt('bf')), {ts}, '{{\"provider\":\"email\",\"providers\":[\"email\"]}}', '{{}}', "
            "{ts}, {ts}, '', '', '', '')".format(
                id=sql_value(u["id"]), email=sql_value(u["email"]), pw=PASSWORD, ts=sql_value(u["created_at"])
            )
        )
    out.append(
        "INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, "
        "raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, "
        "email_change_token_new, recovery_token) VALUES\n" + ",\n".join(user_rows) + "\nON CONFLICT (id) DO NOTHING;\n"
    )

    identity_rows = []
    for u in tables["users"]:
        identity_rows.append(
            "  ({id}, {id}, {id}, jsonb_build_object('sub', {id}, 'email', {email}, 'email_verified', true), "
            "'email', {ts}, {ts}, {ts})".format(id=sql_value(u["id"]), email=sql_value(u["email"]), ts=sql_value(u["created_at"]))
        )
    out.append(
        "INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, "
        "created_at, updated_at) VALUES\n" + ",\n".join(identity_rows) + "\nON CONFLICT DO NOTHING;\n"
    )

    # Upsert in case a signup trigger already created the profile rows.
    profiles = insert("public.profiles", tables["profiles"]).replace(
        "ON CONFLICT (id) DO NOTHING;",
        "ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, timezone = EXCLUDED.timezone;",
    )
    out.append(profiles)
    out.append(insert("public.seasons", tables["seasons"]))
    out.append(insert("public.lead_goals", tables["lead_goals"]))
    out.append(insert("public.pillars", tables["pillars"]))
    out.append(insert("public.actions", tables["actions"],
                      casts={"start_date": "date", "frequency": "public.frequency", "difficulty": "public.difficulty"}))
    out.append(insert("public.action_completion", tables["action_completion"]))
    out.append("COMMIT;\n")

    (OUT_DIR / "seed.sql").write_text("\n".join(out))


def main():
    tables = build()
    write_sql(tables)
    (OUT_DIR / "fake_data" / "fake_data.json").write_text(json.dumps(tables, indent=2, ensure_ascii=False) + "\n")
    counts = ", ".join(f"{k}={len(v)}" for k, v in tables.items())
    print(f"Wrote seed.sql and fake_data/fake_data.json ({counts})")


if __name__ == "__main__":
    main()
