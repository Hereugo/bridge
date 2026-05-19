#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Copy .env.example to .env and adjust secrets."
  cp .env.example .env
fi

echo "Starting Postgres..."
docker compose up postgres -d

echo "Start API in another terminal:"
echo "  cd apps/api && source .venv/bin/activate && uvicorn app.main:app --reload"
echo ""
echo "Start web in another terminal:"
echo "  npm run dev -w apps/web"
echo ""
echo "Optional worker (matching + TTL cleanup):"
echo "  cd apps/api && python -m app.worker"
