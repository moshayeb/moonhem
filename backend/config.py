"""
Load environment from the project root `.env` (repo root, parent of `backend/`).

Supported variables:
  DATABASE_NAME or POSTGRES_DB   — database name (required)
  PASSWORD or POSTGRES_PASSWORD  — database password (required)
  POSTGRES_USER                  — default postgres
  POSTGRES_HOST                  — default localhost
  POSTGRES_PORT                  — default 5432
  CORS_ORIGINS                   — comma-separated; defaults to local Vite URLs
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
_ENV_FILE = PROJECT_ROOT / ".env"

# OS env wins over file (e.g. Docker / CI)
load_dotenv(_ENV_FILE, override=False)

_DEFAULT_CORS = (
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:5174,http://127.0.0.1:5174"
)


@dataclass(frozen=True)
class Settings:
    database_name: str
    database_user: str
    database_password: str
    database_host: str
    database_port: str
    cors_origins: list[str]


def _parse_cors(raw: str | None) -> list[str]:
    if not raw or not raw.strip():
        raw = _DEFAULT_CORS
    return [o.strip() for o in raw.split(",") if o.strip()]


def load_settings() -> Settings:
    db = (os.getenv("POSTGRES_DB") or os.getenv("DATABASE_NAME") or "").strip()
    pw = (os.getenv("POSTGRES_PASSWORD") or os.getenv("PASSWORD") or "").strip()
    return Settings(
        database_name=db,
        database_user=(os.getenv("POSTGRES_USER") or "postgres").strip(),
        database_password=pw,
        database_host=(os.getenv("POSTGRES_HOST") or "localhost").strip(),
        database_port=(os.getenv("POSTGRES_PORT") or "5432").strip(),
        cors_origins=_parse_cors(os.getenv("CORS_ORIGINS")),
    )


settings = load_settings()
