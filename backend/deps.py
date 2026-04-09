"""FastAPI dependencies."""

from __future__ import annotations

from collections.abc import Generator
from typing import Any

from backend.database import get_connection


def get_db() -> Generator[Any, None, None]:
    con = get_connection()
    try:
        yield con
    finally:
        con.close()
