# Two-user hackathon demo

## Fast local dev (skip the 7-day Know week)

In the repo root `.env` (copy from `.env.example`):

```env
# When PHASE2_DURATION_MINUTES < 1440, Know lasts this many minutes (not days).
PHASE2_DURATION_MINUTES=5
PHASE2_DURATION_DAYS=7

# Pair the first two users who submit a summary (FIFO).
MATCHING_SIMPLE_FIRST_PAIR=true
```

You do **not** need to wait for the timer — use **[Dev] End week & run matching** on the Know page for an instant match demo. The short timer is only useful if you want the background worker to auto-mark users ready near the end of the week.

## Prerequisites

```bash
# Database + LiveKit (introduction calls)
docker compose up postgres livekit -d

# Optional: wingman agent joins the room when both humans are in
docker compose up agent -d
```

- **API:** `cd apps/api && source .venv/bin/activate && uvicorn app.main:app --reload`
- **Web:** `npm run dev -w apps/web` (copy `apps/web/.env.local.example` → `apps/web/.env.local`)

Ensure the API has LiveKit env vars (defaults work with local `docker compose`):

```env
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_PUBLIC_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

If the API runs **inside Docker** but the browser is on your machine, keep `LIVEKIT_PUBLIC_URL=ws://localhost:7880` so tokens point at the published port.

## Phase 3 flow (summary → match → LiveKit)

1. **Browser A** — log in as `alice@demo.test`, complete onboarding, pick a persona, open **Know**.
2. **Browser B** (incognito) — log in as `bob@demo.test`, same flow.
3. On **Know**, each user clicks **[Dev] End week & run matching** (submits a demo summary).
   - First user sees “waiting for your match”.
   - Second user triggers pairing of the **first two** ready users; both move to **MATCHED**.
4. Both see the match reveal → **See introduction** → **Join introduction call**.
5. On **/call**, join the LiveKit room. With the **agent** service running, a quiet wingman joins after both humans are present.

Without LiveKit configured, the call page offers **Continue without call (demo)**.

## API shortcuts (Swagger)

- http://localhost:8000/docs
- `POST /journey/summary` — submit structured summary and run matching
- `POST /admin/force-end-phase2` — same as dev button (requires Bearer token)
- `POST /calls/{match_id}/token` — LiveKit room token
- `POST /internal/matching/run` — batch matching for all summary-ready users

## Full stack with Docker

```bash
docker compose up postgres livekit api web agent -d
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` for the web container unless you use the `/api` proxy pattern.
