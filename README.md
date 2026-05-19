# Bridge

AI-powered social matchmaking PoC — Swipe → Know → Match → Wingman.

**Phased implementation:** see [docs/PHASE_CHECKPOINTS.md](docs/PHASE_CHECKPOINTS.md) — stop and commit after each phase.

## Stack

- **Web**: Next.js 15 PWA (`apps/web`) — Warm Night Out UI
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

1. Sign in as `user-a@test.com` and `user-b@test.com` (two browsers).
2. Each completes Swipe → Know.
3. Click **[Dev] End week & run matching** on both (order matters: second user triggers pair).
4. View match reveal → Join introduction call (requires LiveKit env vars).

## Environment

See `.env.example`. Replace ElevenLabs `agent_*_placeholder` IDs in seeded personas after creating agents in the ElevenLabs dashboard.

## Dokploy

Deploy the root `docker-compose.yml` stack: `web`, `api`, `postgres`, `agent`, `worker`.
