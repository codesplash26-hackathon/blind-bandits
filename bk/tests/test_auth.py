import pytest
from httpx2 import AsyncClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models.user import User, UserRole
from tests.conftest import login_headers

REGISTRATION = {
    "name": "Test Tourist",
    "email": "tourist@example.com",
    "password": "safe-password",
}

pytestmark = pytest.mark.anyio


async def test_successful_tourist_registration(
    client: AsyncClient,
    db_session: Session,
) -> None:
    response = await client.post("/api/v1/auth/register", json=REGISTRATION)

    assert response.status_code == 201
    assert response.json()["email"] == REGISTRATION["email"]
    assert response.json()["role"] == "TOURIST"
    assert response.json()["is_active"] is True
    assert "password" not in response.json()
    assert "password_hash" not in response.json()
    assert db_session.scalar(select(User)).role == UserRole.TOURIST  # type: ignore[union-attr]


async def test_duplicate_email_is_rejected(client: AsyncClient) -> None:
    first = await client.post("/api/v1/auth/register", json=REGISTRATION)
    duplicate = await client.post(
        "/api/v1/auth/register",
        json={**REGISTRATION, "email": "TOURIST@example.com"},
    )

    assert first.status_code == 201
    assert duplicate.status_code == 409


async def test_password_is_stored_hashed(
    client: AsyncClient,
    db_session: Session,
) -> None:
    await client.post("/api/v1/auth/register", json=REGISTRATION)
    user = db_session.scalar(select(User).where(User.email == REGISTRATION["email"]))

    assert user is not None
    assert user.password_hash != REGISTRATION["password"]
    assert REGISTRATION["password"] not in user.password_hash
    assert verify_password(REGISTRATION["password"], user.password_hash)


async def test_successful_login_returns_jwt(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json=REGISTRATION)
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": REGISTRATION["email"],
            "password": REGISTRATION["password"],
        },
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["access_token"].count(".") == 2


async def test_invalid_login_is_rejected(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json=REGISTRATION)
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": REGISTRATION["email"], "password": "wrong-password"},
    )

    assert response.status_code == 401


async def test_me_returns_authenticated_user(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json=REGISTRATION)
    headers = await login_headers(
        client,
        REGISTRATION["email"],
        REGISTRATION["password"],
    )

    response = await client.get("/api/v1/auth/me", headers=headers)

    assert response.status_code == 200
    assert response.json()["email"] == REGISTRATION["email"]
    assert response.json()["role"] == "TOURIST"


async def test_me_rejects_missing_token(client: AsyncClient) -> None:
    response = await client.get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


async def test_me_rejects_invalid_token(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer not-a-valid-token"},
    )

    assert response.status_code == 401


async def test_tourist_cannot_list_users(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json=REGISTRATION)
    headers = await login_headers(
        client,
        REGISTRATION["email"],
        REGISTRATION["password"],
    )

    response = await client.get("/api/v1/admin/users", headers=headers)

    assert response.status_code == 403


async def test_admin_can_list_users(client: AsyncClient, admin_user: User) -> None:
    headers = await login_headers(client, admin_user.email, "admin-password")

    response = await client.get("/api/v1/admin/users", headers=headers)

    assert response.status_code == 200
    assert response.json()[0]["email"] == admin_user.email
    assert response.json()[0]["role"] == "ADMIN"


async def test_public_registration_cannot_create_admin(client: AsyncClient) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={**REGISTRATION, "role": "ADMIN"},
    )

    assert response.status_code == 422


async def test_inactive_user_cannot_login(
    client: AsyncClient,
    db_session: Session,
) -> None:
    await client.post("/api/v1/auth/register", json=REGISTRATION)
    user = db_session.scalar(select(User).where(User.email == REGISTRATION["email"]))
    assert user is not None
    user.is_active = False
    db_session.commit()

    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": REGISTRATION["email"],
            "password": REGISTRATION["password"],
        },
    )

    assert response.status_code == 401


async def test_inactive_user_token_is_rejected(
    client: AsyncClient,
    db_session: Session,
) -> None:
    await client.post("/api/v1/auth/register", json=REGISTRATION)
    headers = await login_headers(
        client,
        REGISTRATION["email"],
        REGISTRATION["password"],
    )
    user = db_session.scalar(select(User).where(User.email == REGISTRATION["email"]))
    assert user is not None
    user.is_active = False
    db_session.commit()

    response = await client.get("/api/v1/auth/me", headers=headers)

    assert response.status_code == 401
