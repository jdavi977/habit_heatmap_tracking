"""Generate fake seed data for 5 users.

Writes seed.sql (run against Supabase) and fake_data.json (same rows, for local use).
UUIDs are derived with uuid5, so re-running produces identical output.

    python backend/fake_data/generate.py
"""

import json
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

OUT_DIR = Path(__file__).parent
NAMESPACE = uuid.UUID("6f1c2a4e-9b7d-4c3e-8a21-5d0f3e7b9c11")
PASSWORD = "password123"
TODAY = date(2026, 10, 20)

FREQ = {"D": "daily", "W": "weekly", "M": "monthly"}
DIFF = {"E": "easy", "M": "medium", "H": "hard"}


def uid(*parts):
    return str(uuid.uuid5(NAMESPACE, "/".join(str(p) for p in parts)))


# Each action is (title, frequency, times_per_period, difficulty, is_active).
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
                ("Write a one-sentence job target", "M", 1, "E", True),
                ("Add 5 new companies to the list", "W", 1, "E", True),
                ("Check tier-1 careers pages", "W", 1, "E", True),
                ("Read job postings and list repeating skills", "M", 1, "M", True),
                ("Set up job alerts on 3 boards", "M", 1, "E", True),
                ("Find 3 people with my target job", "M", 1, "M", True),
                ("Review target based on response rate", "M", 1, "M", True),
                ("Research one company in depth", "W", 1, "M", True),
            ],
            "Resume and materials": [
                ("Finish one-page master resume", "M", 1, "H", True),
                ("Get resume reviewed by career centre", "M", 1, "M", True),
                ("Tailor resume to an application", "D", 1, "M", True),
                ("Update LinkedIn profile", "M", 1, "M", True),
                ("Write cover letter template", "M", 1, "M", True),
                ("Practice 30-second pitch out loud", "W", 2, "E", True),
                ("Track which resume version gets responses", "W", 1, "E", True),
                ("Refresh resume with new projects", "M", 1, "E", True),
            ],
            "Skills and portfolio": [
                ("Focused practice on weakest skill", "W", 4, "H", True),
                ("Finish portfolio project", "M", 1, "H", True),
                ("Write project README / case study", "M", 1, "M", True),
                ("Solve coding practice problems", "W", 3, "H", True),
                ("Post something I built on LinkedIn", "W", 1, "M", True),
                ("Get a project reviewed by a senior dev", "M", 1, "M", True),
                ("Complete a cloud fundamentals course", "M", 1, "H", False),
                ("Read one engineering blog post", "W", 2, "E", True),
            ],
            "Networking": [
                ("Send outreach messages", "W", 5, "M", True),
                ("Have a coffee chat", "W", 1, "M", True),
                ("Attend a career fair or meetup", "M", 2, "M", True),
                ("Ask professors for leads", "M", 1, "E", True),
                ("Follow up with new contacts within 48h", "D", 1, "E", True),
                ("Ask for a referral", "W", 1, "H", True),
                ("Update contact log", "W", 1, "E", True),
                ("Send thank-you notes", "D", 1, "E", True),
            ],
            "Applications": [
                ("Submit targeted applications", "W", 8, "M", True),
                ("Apply within 3 days of posting", "W", 1, "M", True),
                ("Log applications in tracker", "D", 1, "E", True),
                ("Follow up on week-old applications", "W", 1, "E", True),
                ("Apply to one stretch role", "W", 1, "H", True),
                ("Review rejection patterns", "M", 1, "M", True),
                ("Clear the application inbox", "D", 1, "E", True),
                ("Apply through a referral", "M", 2, "M", True),
            ],
            "Interview prep": [
                ("Mock technical interview", "W", 1, "H", True),
                ("Write STAR stories", "M", 1, "M", True),
                ("Practice behavioural answers out loud", "W", 2, "M", True),
                ("Review system design basics", "W", 2, "H", True),
                ("Prepare questions for interviewers", "M", 1, "E", True),
                ("Research company before each interview", "W", 1, "E", True),
                ("Debrief after each interview", "W", 1, "E", True),
                ("Record and review a mock answer", "M", 2, "M", True),
            ],
            "Boxing maintenance": [
                ("Boxing class", "W", 3, "H", True),
                ("Shadowboxing rounds", "W", 2, "M", True),
                ("Jump rope 10 minutes", "D", 1, "E", True),
                ("Stretch / mobility", "D", 1, "E", True),
                ("Easy run", "W", 1, "M", True),
                ("Strength session", "W", 1, "H", True),
                ("Film and review sparring", "M", 1, "M", False),
                ("Weigh in", "W", 1, "E", True),
            ],
            "School and health": [
                ("Attend all lectures", "D", 1, "E", True),
                ("Study block for finals", "W", 4, "H", True),
                ("Submit assignments on time", "W", 1, "M", True),
                ("Sleep by midnight", "D", 1, "M", True),
                ("Meal prep", "W", 1, "M", True),
                ("Walk outside 20 minutes", "D", 1, "E", True),
                ("Weekly review and plan", "W", 1, "E", True),
                ("Call family", "W", 1, "E", True),
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
                ("Long run", "W", 1, "H", True),
                ("Easy run", "W", 3, "E", True),
                ("Back-to-back weekend runs", "M", 2, "H", True),
                ("Cross-train on the bike", "W", 1, "M", True),
                ("Track weekly mileage", "W", 1, "E", True),
                ("Run a half-marathon tune-up", "M", 1, "H", True),
                ("Easy recovery jog", "W", 1, "E", True),
                ("Hill repeats", "W", 1, "H", True),
            ],
            "Speed": [
                ("Interval session", "W", 1, "H", True),
                ("Tempo run", "W", 1, "H", True),
                ("Strides after easy runs", "W", 2, "E", True),
                ("Marathon-pace miles", "W", 1, "M", True),
                ("5K time trial", "M", 1, "H", True),
                ("Cadence drills", "W", 2, "E", True),
                ("Fartlek run", "W", 1, "M", False),
                ("Review splits after workouts", "W", 1, "E", True),
            ],
            "Strength": [
                ("Leg strength session", "W", 2, "H", True),
                ("Core circuit", "W", 3, "M", True),
                ("Single-leg balance work", "W", 3, "E", True),
                ("Glute activation before runs", "D", 1, "E", True),
                ("Plyometrics", "W", 1, "M", True),
                ("Upper body session", "W", 1, "M", True),
                ("Calf raises", "D", 1, "E", True),
                ("Hip mobility flow", "W", 3, "E", True),
            ],
            "Recovery": [
                ("Sleep 8 hours", "D", 1, "M", True),
                ("Foam roll", "D", 1, "E", True),
                ("Rest day with no running", "W", 1, "E", True),
                ("Massage or physio", "M", 1, "M", True),
                ("Ice bath after long run", "W", 1, "M", True),
                ("Log morning heart rate", "D", 1, "E", True),
                ("Stretch 15 minutes", "D", 1, "E", True),
                ("Deload week", "M", 1, "E", True),
            ],
            "Nutrition": [
                ("Hit protein target", "D", 1, "M", True),
                ("Drink 3L of water", "D", 1, "E", True),
                ("Practice race-day fuelling on long run", "W", 1, "M", True),
                ("Meal prep for the week", "W", 1, "M", True),
                ("No alcohol on weekdays", "D", 1, "M", True),
                ("Eat vegetables at two meals", "D", 1, "E", True),
                ("Test race breakfast", "M", 2, "E", True),
                ("Carb-load plan written", "M", 1, "E", True),
            ],
            "Gear and logistics": [
                ("Rotate running shoes", "W", 1, "E", True),
                ("Book race travel", "M", 1, "E", True),
                ("Test race outfit on a long run", "M", 1, "E", True),
                ("Charge watch and sync data", "D", 1, "E", True),
                ("Plan long run routes", "W", 1, "E", True),
                ("Buy gels for the block", "M", 1, "E", True),
                ("Check race course map", "M", 1, "E", True),
                ("Replace worn shoes", "M", 1, "M", False),
            ],
            "Mindset": [
                ("Visualise race day", "W", 2, "E", True),
                ("Write race mantra", "M", 1, "E", True),
                ("Journal after key workouts", "W", 2, "E", True),
                ("Run one workout without music", "W", 1, "M", True),
                ("Read running books", "W", 2, "E", True),
                ("Review training log for wins", "W", 1, "E", True),
                ("Meditate 10 minutes", "D", 1, "M", True),
                ("Join a group run", "M", 2, "M", True),
            ],
            "Work and life balance": [
                ("Block calendar for runs", "W", 1, "E", True),
                ("Leave work by 6pm", "D", 1, "M", True),
                ("Date night", "W", 1, "E", True),
                ("Screen off by 10pm", "D", 1, "M", True),
                ("Sunday planning session", "W", 1, "E", True),
                ("Call a friend", "W", 1, "E", True),
                ("Clean the apartment", "W", 1, "E", True),
                ("Budget review", "M", 1, "E", True),
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
                ("Throw pieces on the wheel", "W", 4, "H", True),
                ("Glaze firing", "W", 1, "M", True),
                ("Design a signature mug", "M", 1, "H", True),
                ("Test a new glaze", "W", 1, "M", True),
                ("Quality check finished pieces", "W", 1, "E", True),
                ("Sketch new designs", "W", 2, "E", True),
                ("Build stock to 30 pieces", "M", 1, "H", True),
                ("Clean the studio", "W", 1, "E", True),
            ],
            "Shop setup": [
                ("Choose shop platform", "M", 1, "E", True),
                ("Write product descriptions", "W", 2, "M", True),
                ("Set shipping rates", "M", 1, "M", True),
                ("Write returns policy", "M", 1, "E", True),
                ("Design logo", "M", 1, "M", True),
                ("Set up payments", "M", 1, "M", True),
                ("Order packaging", "M", 1, "E", True),
                ("Test checkout flow", "M", 1, "E", True),
            ],
            "Photography": [
                ("Photograph new pieces", "W", 2, "M", True),
                ("Edit product photos", "W", 2, "M", True),
                ("Build a light box", "M", 1, "M", True),
                ("Shoot lifestyle photos", "M", 2, "M", True),
                ("Film a process video", "W", 1, "H", True),
                ("Study product photography", "W", 1, "E", True),
                ("Reshoot weak listings", "M", 1, "M", True),
                ("Back up photo library", "W", 1, "E", True),
            ],
            "Marketing": [
                ("Post on Instagram", "W", 4, "M", True),
                ("Send newsletter", "W", 1, "M", True),
                ("Reply to comments and DMs", "D", 1, "E", True),
                ("Reach out to a local shop", "W", 1, "H", True),
                ("Run a launch giveaway", "M", 1, "M", True),
                ("Collaborate with a creator", "M", 1, "H", True),
                ("Review post analytics", "W", 1, "E", True),
                ("Run paid ads", "M", 1, "M", False),
            ],
            "Sales and markets": [
                ("Book a craft market stall", "M", 2, "M", True),
                ("Follow up with past buyers", "W", 1, "E", True),
                ("Ask buyers for reviews", "W", 1, "E", True),
                ("Pack and ship orders", "D", 1, "M", True),
                ("Create a gift bundle", "M", 1, "M", True),
                ("Offer custom commissions", "M", 1, "H", True),
                ("Track sales count", "W", 1, "E", True),
                ("Pitch wholesale to a cafe", "M", 1, "H", True),
            ],
            "Money": [
                ("Log expenses", "W", 1, "E", True),
                ("Price pieces using cost formula", "M", 1, "M", True),
                ("Set aside money for tax", "M", 1, "E", True),
                ("Review profit per piece", "M", 1, "M", True),
                ("Open business bank account", "M", 1, "E", True),
                ("Monthly budget review", "M", 1, "E", True),
                ("Save receipts", "W", 1, "E", True),
                ("Research grants", "M", 1, "M", True),
            ],
            "Learning": [
                ("Watch a pottery tutorial", "W", 2, "E", True),
                ("Take a glaze chemistry class", "M", 1, "H", True),
                ("Read about small business", "W", 2, "E", True),
                ("Visit a gallery", "M", 1, "E", True),
                ("Ask a mentor a question", "M", 2, "M", True),
                ("Join a makers forum", "M", 1, "E", True),
                ("Practice handbuilding", "W", 1, "M", True),
                ("Write lessons learned", "W", 1, "E", True),
            ],
            "Wellbeing": [
                ("Wrist and back stretches", "D", 1, "E", True),
                ("Yoga class", "W", 2, "M", True),
                ("Day off from the studio", "W", 1, "E", True),
                ("Walk in the park", "D", 1, "E", True),
                ("Sleep 7+ hours", "D", 1, "M", True),
                ("Cook dinner at home", "W", 4, "E", True),
                ("See friends", "W", 1, "E", True),
                ("Journal", "W", 3, "E", True),
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
                ("Anki review", "D", 1, "M", True),
                ("Add 20 new words", "D", 1, "M", True),
                ("Review N2 word list section", "W", 3, "M", True),
                ("Write sentences with new words", "W", 2, "M", True),
                ("Clear leech cards", "W", 1, "E", True),
                ("Learn one set of synonyms", "W", 1, "M", True),
                ("Vocabulary self-test", "W", 1, "E", True),
                ("Review katakana loanwords", "W", 1, "E", True),
            ],
            "Kanji": [
                ("Learn 10 new kanji", "D", 1, "H", True),
                ("Handwrite kanji practice", "W", 3, "M", True),
                ("Kanji reading quiz", "W", 2, "M", True),
                ("Review radicals", "W", 1, "E", True),
                ("Read kanji in the wild and note them", "D", 1, "E", True),
                ("Monthly kanji test", "M", 1, "H", True),
                ("Review similar-looking kanji", "W", 1, "M", True),
                ("Kanji compound drill", "W", 2, "M", True),
            ],
            "Grammar": [
                ("Study 3 grammar points", "W", 3, "H", True),
                ("Grammar practice questions", "W", 3, "M", True),
                ("Review grammar notebook", "W", 1, "E", True),
                ("Write example sentences", "W", 2, "M", True),
                ("Ask tutor about confusing grammar", "W", 1, "E", True),
                ("Grammar mock section", "M", 2, "H", True),
                ("Compare similar grammar points", "W", 1, "M", True),
                ("Shadow grammar example audio", "W", 2, "M", True),
            ],
            "Reading": [
                ("Read an NHK Easy article", "D", 1, "E", True),
                ("Read a regular NHK article", "W", 3, "H", True),
                ("Timed reading practice", "W", 2, "H", True),
                ("Read a manga chapter", "W", 2, "E", True),
                ("Read a short story", "W", 1, "M", True),
                ("Summarise an article in Japanese", "W", 1, "H", True),
                ("Read N2 reading practice book", "W", 2, "M", True),
                ("Read a novel chapter", "W", 1, "H", False),
            ],
            "Listening": [
                ("Listen to a Japanese podcast", "D", 1, "E", True),
                ("N2 listening practice", "W", 3, "H", True),
                ("Shadowing practice", "W", 3, "M", True),
                ("Watch a drama episode without subs", "W", 1, "H", True),
                ("Dictation exercise", "W", 1, "H", True),
                ("Listen to news broadcast", "W", 2, "M", True),
                ("Rewatch with Japanese subs", "W", 1, "E", True),
                ("Note unknown words from audio", "W", 2, "E", True),
            ],
            "Practice tests": [
                ("Full mock exam", "M", 2, "H", True),
                ("Review mock exam mistakes", "M", 2, "M", True),
                ("Timed section drill", "W", 1, "H", True),
                ("Track score per section", "M", 2, "E", True),
                ("Practice answer sheet timing", "M", 1, "E", True),
                ("Book exam venue travel", "M", 1, "E", True),
                ("Redo missed questions", "W", 1, "M", True),
                ("Simulate exam morning", "M", 1, "M", True),
            ],
            "Speaking": [
                ("iTalki tutor session", "W", 2, "H", True),
                ("Language exchange meetup", "W", 1, "M", True),
                ("Talk to myself in Japanese", "D", 1, "E", True),
                ("Record a 2-minute monologue", "W", 1, "M", True),
                ("Order food in Japanese", "W", 1, "E", True),
                ("Message a Japanese friend", "W", 2, "E", True),
                ("Practice keigo phrases", "W", 1, "M", True),
                ("Join a Japanese Discord voice chat", "M", 2, "M", False),
            ],
            "Routine": [
                ("Study before work", "D", 1, "M", True),
                ("Phone in Japanese", "D", 1, "E", True),
                ("Weekly study plan", "W", 1, "E", True),
                ("Gym session", "W", 2, "M", True),
                ("Sleep by 11:30pm", "D", 1, "M", True),
                ("Tidy study desk", "W", 1, "E", True),
                ("Sunday rest from studying", "W", 1, "E", True),
                ("Review progress heatmap", "W", 1, "E", True),
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
                ("Log every expense", "D", 1, "E", True),
                ("Weekly budget check-in", "W", 1, "E", True),
                ("Set monthly spending caps", "M", 1, "M", True),
                ("Review bank statement", "M", 1, "M", True),
                ("Use cash envelope for groceries", "W", 1, "M", True),
                ("Plan meals to budget", "W", 1, "M", True),
                ("Zero-based budget for next month", "M", 1, "H", True),
                ("Review categories that went over", "M", 1, "E", True),
            ],
            "Debt payments": [
                ("Make extra card payment", "W", 1, "H", True),
                ("Pay minimum on time", "M", 1, "E", True),
                ("Call bank to lower interest rate", "M", 1, "H", True),
                ("Track remaining balance", "W", 1, "E", True),
                ("Put windfalls toward debt", "M", 1, "M", True),
                ("Set up automatic payment", "M", 1, "E", True),
                ("Freeze card in the freezer", "M", 1, "E", True),
                ("Research balance transfer", "M", 1, "M", False),
            ],
            "Cutting costs": [
                ("Cancel one unused subscription", "M", 1, "E", True),
                ("No-spend day", "W", 3, "M", True),
                ("Cook instead of eating out", "W", 5, "M", True),
                ("Bring lunch to work", "W", 4, "E", True),
                ("Compare phone and internet plans", "M", 1, "M", True),
                ("Unsubscribe from shop emails", "M", 1, "E", True),
                ("Shop with a list only", "W", 1, "E", True),
                ("Wait 48h before non-essential buys", "D", 1, "M", True),
            ],
            "Extra income": [
                ("Freelance translation job", "W", 2, "H", True),
                ("Sell unused items online", "W", 1, "M", True),
                ("Ask for a raise", "M", 1, "H", True),
                ("Pitch a new freelance client", "W", 1, "H", True),
                ("Tutor Italian online", "W", 2, "M", True),
                ("Update freelance profile", "M", 1, "E", True),
                ("Track side income", "W", 1, "E", True),
                ("Pick up an extra shift", "M", 2, "H", True),
            ],
            "Emergency fund": [
                ("Transfer €20 to savings", "W", 1, "M", True),
                ("Open a separate savings account", "M", 1, "E", True),
                ("Round up purchases to savings", "D", 1, "E", True),
                ("Check emergency fund balance", "M", 1, "E", True),
                ("List true emergencies", "M", 1, "E", True),
                ("Save coin jar", "W", 1, "E", True),
                ("Move birthday money to savings", "M", 1, "E", True),
                ("Review insurance coverage", "M", 1, "M", True),
            ],
            "Money knowledge": [
                ("Read a personal finance chapter", "W", 2, "E", True),
                ("Listen to a money podcast", "W", 2, "E", True),
                ("Learn how card interest is calculated", "M", 1, "M", True),
                ("Check credit score", "M", 1, "E", True),
                ("Write down money beliefs", "M", 1, "M", True),
                ("Talk money with a friend", "M", 1, "M", True),
                ("Watch an investing basics video", "W", 1, "E", True),
                ("Plan post-debt savings goal", "M", 1, "E", True),
            ],
            "Social life on a budget": [
                ("Host a potluck", "M", 1, "M", True),
                ("Find free events", "W", 1, "E", True),
                ("Suggest cheap plans to friends", "W", 1, "M", True),
                ("Walk with a friend", "W", 2, "E", True),
                ("Library visit", "W", 1, "E", True),
                ("Say no to one expensive invite", "M", 2, "H", True),
                ("Game night at home", "M", 2, "E", True),
                ("Picnic instead of restaurant", "M", 1, "E", True),
            ],
            "Health": [
                ("Home workout", "W", 3, "M", True),
                ("Walk to work", "W", 3, "E", True),
                ("Sleep by 11pm", "D", 1, "M", True),
                ("Drink water before coffee", "D", 1, "E", True),
                ("Stretch before bed", "D", 1, "E", True),
                ("Meditate 5 minutes", "D", 1, "E", True),
                ("Cook a new healthy recipe", "W", 1, "M", True),
                ("Screen-free evening", "W", 2, "M", True),
            ],
        },
    },
]


def build():
    tables = {k: [] for k in ("users", "profiles", "seasons", "lead_goals", "pillars", "actions")}

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
            for a_idx, (title, freq, times, diff, active) in enumerate(actions):
                action_date = date.fromisoformat(start)
                if a_idx % 4 == 3:
                    action_date = min(action_date + timedelta(days=3 + (p_idx * 5 + a_idx) % 25), latest)
                tables["actions"].append({
                    "id": uid("action", pillar_id, title),
                    "pillar_id": pillar_id,
                    "title": title,
                    "date": action_date.isoformat(),
                    "frequency": FREQ[freq],
                    "difficulty": DIFF[diff],
                    "times_per_period": times,
                    "is_active": active,
                })

    return tables


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
        "-- Generated by backend/fake_data/generate.py. Do not edit by hand.",
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
                      casts={"date": "date", "frequency": "public.frequency", "difficulty": "public.difficulty"}))
    out.append("COMMIT;\n")

    (OUT_DIR / "seed.sql").write_text("\n".join(out))


def main():
    tables = build()
    write_sql(tables)
    (OUT_DIR / "fake_data.json").write_text(json.dumps(tables, indent=2, ensure_ascii=False) + "\n")
    counts = ", ".join(f"{k}={len(v)}" for k, v in tables.items())
    print(f"Wrote seed.sql and fake_data.json ({counts})")


if __name__ == "__main__":
    main()
