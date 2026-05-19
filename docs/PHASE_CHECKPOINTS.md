# Implementation phase checkpoints

Stop and commit after each phase. Suggested commit messages are below.

## Phase 1 — Scaffold (commit first)

**Includes:** monorepo layout, `docker-compose.yml`, `.env.example`, `packages/shared`, FastAPI app shell + `/health` + Swagger, Next.js shell (Warm Night Out theme, web manifest), LiveKit agent stub, README.

**Verify:**
```bash
docker compose up postgres -d
cd apps/api && source .venv/bin/activate && uvicorn app.main:app --reload
# http://localhost:8000/docs
cd apps/web && npm run dev
# http://localhost:3000
```

**Commit message:** `chore: scaffold Bridge monorepo (Next.js, FastAPI, Docker)`

---

## Phase 2 — Auth & journey state

**Includes:** magic link auth (NextAuth + FastAPI JWT), `users` / `user_journeys`, `PHASE2_DURATION_*` env, phase routing.

**Verify:** Request magic link → verify → land on onboarding; API `/journey/me` returns phase.

**Commit message:** `feat: magic link auth and journey phase state machine`

---

## Phase 3 — Swipe (Phase 1 product)

**Includes:** persona seed data, swipe UI, `POST /journey/select-persona`.

**Verify:** See 4 personas, select one → transitions to Know.

**Commit message:** `feat: persona swipe onboarding (Phase 1)`

---

## Phase 4 — Know (Phase 2 product)

**Includes:** ElevenLabs embed, summary submit, webhooks, dev “end week” button.

**Commit message:** `feat: companion voice phase with summary pipeline`

---

## Phase 5 — Match (Phase 3 product)

**Includes:** LLM matching, connection cards, summary deletion, worker matching cron.

**Commit message:** `feat: LLM matching and connection cards`

---

## Phase 6 — Wingman call (Phase 4 product)

**Includes:** LiveKit tokens, call UI, agent worker.

**Commit message:** `feat: LiveKit wingman three-way call`

---

## Phase 7 — Privacy & cleanup

**Includes:** TTL cron, `DELETE /users/me`, privacy onboarding copy.

**Commit message:** `feat: GDPR cleanup cron and account deletion`
