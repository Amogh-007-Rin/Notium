import pytest
from app.utils.auth import get_password_hash, verify_password, create_access_token, decode_token


def test_password_hash_and_verify():
    pw = "SecurePassword123!"
    hashed = get_password_hash(pw)
    assert verify_password(pw, hashed)
    assert not verify_password("wrong", hashed)


def test_create_and_decode_token():
    data = {"sub": "1", "email": "user@test.com", "role": "decision_maker"}
    token = create_access_token(data)
    payload = decode_token(token)
    assert payload["sub"] == "1"
    assert payload["email"] == "user@test.com"


def test_login_success(client, seed_user):
    resp = client.post("/api/auth/login", json={"email": "test@test.com", "password": "Test1234!"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["role"] == "decision_maker"


def test_login_wrong_password(client, seed_user):
    resp = client.post("/api/auth/login", json={"email": "test@test.com", "password": "wrong"})
    assert resp.status_code == 401


def test_login_unknown_email(client):
    resp = client.post("/api/auth/login", json={"email": "noone@test.com", "password": "Test1234!"})
    assert resp.status_code == 401


def test_get_me(client, auth_headers):
    resp = client.get("/api/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "test@test.com"


def test_logout(client, auth_headers):
    resp = client.post("/api/auth/logout", headers=auth_headers)
    assert resp.status_code == 200
