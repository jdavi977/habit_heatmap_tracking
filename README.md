# habit_heatmap_tracking.

Habit heatmap tracker: React + TypeScript frontend (Vite) with a
Supabase backend (Postgres + Auth).

## Project layout

```
frontend/   React + TypeScript app (Vite)
backend/    Supabase schema and seed SQL
notes/      Research and planning docs
```

## Setup

Requires [Node.js](https://nodejs.org/) (with npm) for the frontend and
[uv](https://docs.astral.sh/uv/) for the repo tooling (it installs
Python 3.13 if needed).

```bash
# Repo tooling (Ruff + pre-commit)
uv sync                      # creates .venv and installs dev tools
source .venv/bin/activate
pre-commit install           # once per clone: run hooks on every commit

# Frontend
cd frontend
npm install
```

### Dependencies

- **Frontend:** `frontend/package.json`; exact versions are locked in
  `frontend/package-lock.json` (commit it). Add packages with
  `npm install <pkg>` (or `npm install -D <pkg>` for dev tools) from
  inside `frontend/`.
- **Repo tooling:** `pyproject.toml`; exact versions are locked in
  `uv.lock` (commit it). Add packages with `uv add --dev <pkg>`, never
  `pip install`.

## Running

```bash
cd frontend
npm run dev                  # dev server at http://localhost:5173
npm run build                # type-check and build to frontend/dist
npm run preview              # serve the production build locally
```

## Formatting and linting

```bash
# Frontend
cd frontend && npm run lint  # oxlint

# Python (repo root)
ruff format .
ruff check . --fix
```
