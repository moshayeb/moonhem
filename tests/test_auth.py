"""Login uses the same authenticate_user path as protected routes."""

from __future__ import annotations

from unittest.mock import patch

from backend.passwords import hash_password


@patch("backend.auth_utils.get_user_by_email")
def test_login_success(mock_get_user, client):
    mock_get_user.return_value = {
        "id": 1,
        "mail": "buyer@example.com",
        "first_name": "Bo",
        "surname": "Buyer",
        "password": hash_password("goodpw"),
    }
    res = client.post("/login", auth=("buyer@example.com", "goodpw"))
    assert res.status_code == 200
    body = res.json()
    assert body["user"]["mail"] == "buyer@example.com"
    assert "password" not in body["user"]


@patch("backend.auth_utils.get_user_by_email")
def test_login_wrong_password(mock_get_user, client):
    mock_get_user.return_value = {
        "id": 1,
        "mail": "buyer@example.com",
        "password": hash_password("goodpw"),
    }
    res = client.post("/login", auth=("buyer@example.com", "badpw"))
    assert res.status_code == 401


@patch("backend.auth_utils.get_user_by_email")
def test_login_unknown_user(mock_get_user, client):
    mock_get_user.return_value = None
    res = client.post("/login", auth=("ghost@example.com", "x"))
    assert res.status_code == 401


@patch("backend.auth_utils.get_user_by_email")
def test_me_success(mock_get_user, client):
    mock_get_user.return_value = {
        "id": 1,
        "mail": "buyer@example.com",
        "first_name": "Bo",
        "surname": "Buyer",
        "password": hash_password("goodpw"),
    }
    res = client.get("/me", auth=("buyer@example.com", "goodpw"))
    assert res.status_code == 200
    body = res.json()
    assert body["user"]["mail"] == "buyer@example.com"
    assert "password" not in body["user"]


@patch("backend.auth_utils.get_user_by_email")
def test_me_invalid(mock_get_user, client):
    mock_get_user.return_value = None
    res = client.get("/me", auth=("ghost@example.com", "x"))
    assert res.status_code == 401


@patch("backend.app.create_user")
@patch("backend.app.create_address")
@patch("backend.app.get_role_id_by_name")
@patch("backend.app.get_user_by_email")
def test_register_success(mock_get_mail, mock_role, mock_addr, mock_create_user, client):
    mock_get_mail.return_value = None
    mock_role.return_value = 3
    mock_addr.return_value = 99
    mock_create_user.return_value = 42
    res = client.post(
        "/register",
        json={
            "first_name": "Test",
            "surname": "Buyer",
            "mail": "newbuyer@example.com",
            "password": "longenough",
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert body["id"] == 42


@patch("backend.app.get_user_by_email")
def test_register_duplicate_email(mock_get_mail, client):
    mock_get_mail.return_value = {"id": 1, "mail": "taken@example.com"}
    res = client.post(
        "/register",
        json={
            "first_name": "A",
            "surname": "B",
            "mail": "taken@example.com",
            "password": "longenough",
        },
    )
    assert res.status_code == 400
