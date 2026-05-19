#!/usr/bin/env python3
"""Test DB connectivity and print all users. Run from repo root or apps/api."""

import sys
from pathlib import Path

API_ROOT = Path(__file__).resolve().parents[1] / "apps" / "api"
sys.path.insert(0, str(API_ROOT))

from sqlalchemy import text

from app.config import settings
from app.database import SessionLocal
from app.models import User


def main() -> int:
    print(f"DATABASE_URL host: {settings.database_url.split('@')[-1] if '@' in settings.database_url else settings.database_url}")
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
            users = db.query(User).order_by(User.created_at).all()
    except Exception as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1

    print(f"OK: connected ({len(users)} user(s))")
    if not users:
        print("(no rows in users table)")
        return 0

    for u in users:
        deleted = " [deleted]" if u.deleted_at else ""
        print(f"  {u.id}  {u.email}  phase={u.current_phase.value}{deleted}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
