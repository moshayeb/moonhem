"""Single entry point for PostgreSQL connections."""

from __future__ import annotations

import psycopg2

from backend.config import settings


def get_connection():
    if not settings.database_name or not settings.database_password:
        raise RuntimeError(
            "Database credentials missing. Create a `.env` file at the project root with "
            "DATABASE_NAME and PASSWORD (see `.env.example`). "
            "If PostgreSQL is not running, start it (e.g. `docker compose up -d` in this repo)."
        )
    try:
        return psycopg2.connect(
            dbname=settings.database_name,
            user=settings.database_user,
            password=settings.database_password,
            host=settings.database_host,
            port=settings.database_port,
            connect_timeout=10,
        )
    except psycopg2.OperationalError as e:
        raise RuntimeError(
            f"Could not connect to PostgreSQL at {settings.database_host}:{settings.database_port} "
            f"(database={settings.database_name}). Is PostgreSQL running? {e}"
        ) from e
