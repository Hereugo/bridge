# Two-user hackathon demo

## Prerequisites

- Postgres: `docker compose up postgres -d`
- API: `cd apps/api && source .venv/bin/activate && uvicorn app.main:app --reload`
- Web: `npm run dev -w apps/web` (copy `apps/web/.env.local.example` → `apps/web/.env.local`)

## Steps

1. **Browser A** — log in as `alice@demo.test` (or any `you@domain.com`), complete privacy onboarding, pick a persona.
2. **Browser B** (incognito) — log in as `bob@demo.test`, same flow.

Note: `.test` emails work in dev; use `alice@gmail.com` if you prefer a conventional address.
3. On each **Know** screen, click **[Dev] End week & run matching** (second user triggers the pair).
4. Both users see the in-app match reveal → **See introduction** → **Join introduction call**.
5. LiveKit optional: without `LIVEKIT_*` env vars, use **Complete demo without call** on the call screen.

## API shortcuts (Swagger)

- http://localhost:8000/docs
- `POST /admin/force-end-phase2` — same as dev button (requires Bearer token)
- `POST /internal/matching/run` — batch matching for ready users
