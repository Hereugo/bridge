# Dokploy deployment (`/api` path)

Bridge serves the **FastAPI backend** at `/api` on the same host as Next.js. The `/api` prefix is **stripped** before requests reach FastAPI (routes stay `/auth`, `/journey`, etc.).

Next.js **NextAuth** lives at `/api/auth/signin`, `/api/auth/callback`, … and must **not** be sent to FastAPI.

## Recommended: one public domain on the **web** app only

Expose only the **frontend** application on your domain. Keep the **API** app off the public internet (no public domain on the API service).

### Web app environment

| Variable | Example | Notes |
|----------|---------|--------|
| `NEXTAUTH_URL` | `https://app.example.com` | Site root, not `/api` |
| `NEXTAUTH_SECRET` | (random) | |
| `NEXT_PUBLIC_API_URL` | `https://app.example.com/api` | Browser + webhooks |
| `API_PROXY_TARGET` | `http://<api-service-name>:8000` | Internal URL on Dokploy network (service name from API app) |

The web image includes **middleware** that proxies `/api/*` → `API_PROXY_TARGET` with `/api` stripped, except NextAuth paths under `/api/auth/{signin,callback,session,...}`.

Rebuild/redeploy the web app after changing `NEXT_PUBLIC_*` (build-time).

### API app environment

No public domain. Same vars as `.env.example` (`DATABASE_URL`, `API_JWT_SECRET`, `CORS_ORIGINS`, …).

`CORS_ORIGINS` should be `https://app.example.com` (frontend origin).

`DATABASE_URL` host must be the **internal** Postgres hostname on Dokploy, not `localhost`.

### Postgres

Official `postgres:16` image; env: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.

---

## Alternative: nginx gateway (Docker Compose)

If you deploy the full stack with Compose on the server:

```bash
docker compose -f docker-compose.yml -f docker-compose.proxy.yml up -d
```

Point Dokploy (or DNS) at the **gateway** service port. Config: `deploy/nginx/default.conf`.

Env on **web** when using the gateway:

- `NEXT_PUBLIC_API_URL=https://app.example.com/api`
- `API_PROXY_TARGET=http://api:8000`

Do **not** attach a separate public `/api` route to the API container when using the gateway or web middleware—routing is already handled.

---

## If you attach `/api` on the API app in Dokploy

Enable **Strip path** / `stripPrefix` for `/api` so the container receives `/journey/...` not `/api/journey/...`.

You **must** also route these to the **web** app (not the API app):

- `/api/auth/signin`
- `/api/auth/signout`
- `/api/auth/callback` (and subpaths)
- `/api/auth/session`
- `/api/auth/csrf`
- `/api/auth/providers`
- `/api/auth/error`

Route to the **API** app (with strip):

- `/api/auth/magic-link`, `/api/auth/verify`, `/api/auth/sync`
- `/api/journey`, `/api/users`, `/api/calls`, `/api/matches`, `/api/personas`, `/api/webhooks`, `/api/internal`, `/api/admin`, `/api/health`, `/api/docs`, …

Using **web-only public + `API_PROXY_TARGET`** avoids maintaining that split in Traefik.

---

## Build settings (unchanged)

| App | Build context | Dockerfile |
|-----|---------------|------------|
| API | repo root (`.`) | `apps/api/Dockerfile` |
| Web | repo root (`.`) | `apps/web/Dockerfile` |

---

## Local dev with `/api` path

```bash
# .env.local on apps/web or root
NEXT_PUBLIC_API_URL=http://localhost:3000/api
API_PROXY_TARGET=http://localhost:8000
```

Run API on `:8000` and web on `:3000`. Browser calls `/api/...` on the web server; middleware proxies to FastAPI.

Default local setup (API on `:8000` directly) needs no `API_PROXY_TARGET` and keeps `NEXT_PUBLIC_API_URL=http://localhost:8000`.
