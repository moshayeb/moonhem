"""POST /messages requires valid Basic auth; sender id comes from auth."""

from __future__ import annotations

from unittest.mock import patch

from backend.passwords import hash_password


def test_messages_missing_auth_returns_401(client):
    res = client.post(
        "/messages",
        json={"receiver_id": 2, "listing_id": 3, "content": "Hello"},
    )
    assert res.status_code == 401


@patch("backend.auth_utils.get_user_by_email")
def test_messages_wrong_password_returns_401(mock_get_user, client):
    mock_get_user.return_value = {
        "id": 9,
        "mail": "u@example.com",
        "password": hash_password("right"),
    }
    res = client.post(
        "/messages",
        json={"receiver_id": 2, "listing_id": 3, "content": "Hello"},
        auth=("u@example.com", "wrong"),
    )
    assert res.status_code == 401


@patch("backend.app.create_message")
@patch("backend.auth_utils.get_user_by_email")
def test_messages_success_uses_sender_from_auth(
    mock_get_user, mock_create, client, mock_con
):
    mock_get_user.return_value = {
        "id": 42,
        "mail": "sender@example.com",
        "password": hash_password("ok"),
    }
    mock_create.return_value = {
        "id": 100,
        "sender_id": 42,
        "receiver_id": 2,
        "listing_id": 3,
        "content": "Hi",
        "created_at": None,
    }
    res = client.post(
        "/messages",
        json={"receiver_id": 2, "listing_id": 3, "content": "Hi"},
        auth=("sender@example.com", "ok"),
    )
    assert res.status_code == 200
    mock_create.assert_called_once_with(mock_con, 42, 2, 3, "Hi")
