# habit_heatmap_tracking.

## Setup

Requires [uv](https://docs.astral.sh/uv/) (it installs Python 3.13 if
needed).

```bash
uv sync                      # creates .venv and installs everything
source .venv/bin/activate
pre-commit install           # once per clone: run Ruff on every commit
```

Dependencies live in `pyproject.toml`; exact versions are locked in
`uv.lock` (commit it). Add packages with `uv add <pkg>` (or
`uv add --dev <pkg>` for dev tools), never `pip install`.

## Running

```bash
cd frontend && reflex run          # frontend
```

## Formatting and linting

```bash
ruff format .
ruff check . --fix
```
