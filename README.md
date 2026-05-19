# Bridge

AI-powered social matchmaking PoC — Swipe → Know → Match → Wingman.

**Phased implementation:** see [docs/PHASE_CHECKPOINTS.md](docs/PHASE_CHECKPOINTS.md) — stop and commit after each phase.

## Stack

- **Web**: Next.js 15 (`apps/web`) — Warm Night Out UI, web app manifest
- **API**: FastAPI + Swagger (`apps/api`) — http://localhost:8000/docs
- **Agent**: LiveKit wingman worker (`apps/agent`)
- **DB**: PostgreSQL 16

## Quick start (local)

```bash
cp .env.example .env
docker compose up postgres -d

# API
cd apps/api && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Web (another terminal)
cd ../.. && npm install
npm run dev -w apps/web
```

Open http://localhost:3000 — magic link prints to API console.

## Hackathon demo (two users)

See [docs/DEMO.md](docs/DEMO.md) for the full walkthrough.

1. Sign in as `alice@demo.test` and `bob@demo.test` (two browsers / incognito).
2. Complete onboarding → Swipe → Know.
3. Click **[Dev] End week & run matching** on both (second user triggers the pair).
4. Match reveal → introduction → call (or skip call if LiveKit is not configured).

See **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** for ChunkLoadError and dev cache issues.

## Environment

See `.env.example`. For voice and calls, see **[docs/SETUP_VOICE.md](docs/SETUP_VOICE.md)** (ElevenLabs + LiveKit step-by-step).

Replace ElevenLabs `agent_*_placeholder` IDs in the `personas` table after creating agents in the ElevenLabs dashboard.

## Dokploy

Deploy the root `docker-compose.yml` stack: `web`, `api`, `postgres`, `agent`, `worker`.
