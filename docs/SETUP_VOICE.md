# ElevenLabs & LiveKit setup

## ElevenLabs (Phase 2 companion voice)

### 1. Get an API key

1. Sign up at [elevenlabs.io](https://elevenlabs.io).
2. Open **Profile → API Keys** (or **Developers**).
3. Create a key and copy it.

### 2. Create Conversational AI agents (one per persona)

1. In the dashboard go to **Conversational AI** → **Agents**.
2. Create an agent for each Bridge persona (Noor, Milan, Sage, Ravi).
3. Configure:
   - **Voice** — pick a distinct voice per persona.
   - **System prompt** — warm companion, never mention loneliness/therapy; collect interests and availability organically.
4. Copy each agent’s **Agent ID** (often looks like `agent_...` or a UUID).

### 3. Put keys in `.env`

At the repo root (used by API + Docker):

```env
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxxxxx
```

Optional (if you configure webhooks in ElevenLabs):

```env
ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret
```

Restart the API after changing env vars.

### 4. Wire agent IDs into Postgres

Personas are seeded with placeholders. Update them with your real IDs.

**Option A — SQL** (after API has run once to create tables):

```sql
UPDATE personas SET elevenlabs_agent_id = 'YOUR_NOOR_AGENT_ID' WHERE display_name = 'Noor';
UPDATE personas SET elevenlabs_agent_id = 'YOUR_MILAN_AGENT_ID' WHERE display_name = 'Milan';
-- repeat for Sage, Ravi
```

**Option B — re-seed**  
Delete persona rows and update `apps/api/app/seed.py` with real IDs, then restart API (only if table is empty or you truncate `personas`).

### 5. Verify in the app

1. Log in → onboarding → swipe → pick a persona → **Know**.
2. The ElevenLabs widget should load (`<elevenlabs-convai agent-id="...">`).
3. If you still see “Configure ELEVENLABS agent ID”, the DB still has `agent_*_placeholder` values.

### Webhooks (optional)

Point ElevenLabs webhooks to:

`https://your-api-domain/webhooks/elevenlabs`

For local dev, use a tunnel (ngrok, Cloudflare Tunnel) to `http://localhost:8000/webhooks/elevenlabs`.

---

## LiveKit (Phase 4 wingman call)

You need a **LiveKit server** (cloud or local) plus API key/secret for minting room tokens.

### Option A — LiveKit Cloud (simplest for demo)

1. Sign up at [cloud.livekit.io](https://cloud.livekit.io).
2. Create a project.
3. Copy from the project settings:
   - **WebSocket URL** (e.g. `wss://your-project.livekit.cloud`)
   - **API Key**
   - **API Secret**

Add to root `.env`:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxx
LIVEKIT_API_SECRET=your_secret_here
```

Restart **API** and **agent** containers/processes.

### Option B — Local LiveKit server (Docker)

```bash
docker run --rm -p 7880:7880 \
  -e LIVEKIT_KEYS="devkey: secret" \
  livekit/livekit-server --dev
```

Then in `.env`:

```env
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

Browsers need `ws://` for local; production should use `wss://` behind TLS.

### Wingman agent worker

The Python worker joins rooms as the third participant (wingman).

```bash
cd apps/agent
python3.11 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export LIVEKIT_URL=wss://...
export LIVEKIT_API_KEY=...
export LIVEKIT_API_SECRET=...
export ELEVENLABS_API_KEY=sk_...
export API_URL=http://localhost:8000

python agent.py dev
```

Or via Docker Compose: the `agent` service reads the same `LIVEKIT_*` and `ELEVENLABS_API_KEY` from `.env`.

### Verify Phase 4

1. Two matched users → **Join introduction call**.
2. API `POST /calls/{match_id}/token` should return `200` with `token` and `livekit_url`.
3. If you see “LiveKit not configured”, check env vars on the **api** service and restart.

---

## Quick checklist

| Step | ElevenLabs | LiveKit |
|------|------------|---------|
| Account | elevenlabs.io | cloud.livekit.io or local server |
| Env vars | `ELEVENLABS_API_KEY` | `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` |
| Extra config | Agent IDs in `personas` table | Run `apps/agent` worker |
| Who uses it | Browser widget (Phase 2) | Browser + agent worker (Phase 4) |

Matching (Phase 3) uses **OpenAI** or **Anthropic** separately — set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` and `MATCHING_LLM_PROVIDER` in the same `.env`.
