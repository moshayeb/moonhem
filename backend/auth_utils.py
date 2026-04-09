"""Password check and user shaping for HTTP Basic auth."""

from __future__ import annotations

from typing import Any

from fastapi import HTTPException
from fastapi.security import HTTPBasicCredentials
from psycopg2.extras import RealDictCursor

from backend.passwords import verify_password


def get_user_by_email(con, email: str):
    with con.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM users WHERE mail = %s", (email,))
        return cur.fetchone()


def user_without_password(row: Any) -> dict | None:
    if row is None:
        return None
    u = dict(row)
    u.pop("password", None)
    return u


def authenticate_user(con, credentials: HTTPBasicCredentials) -> dict:
    """
    Validate Basic credentials against the database and return the user dict
    without the password field. Raises 401 if invalid.
    """
    user = get_user_by_email(con, credentials.username)
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    out = user_without_password(user)
    assert out is not None
    return out
