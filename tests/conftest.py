"""Shared TestClient with DB dependency overridden (no real PostgreSQL)."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from backend.app import app
from backend.deps import get_db


@pytest.fixture
def mock_con() -> MagicMock:
    return MagicMock()


@pytest.fixture
def client(mock_con: MagicMock):
    def override_get_db():
        yield mock_con

    app.dependency_overrides[get_db] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()
