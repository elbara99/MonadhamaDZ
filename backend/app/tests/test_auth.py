"""Tests for authentication endpoints."""

from __future__ import annotations

import pytest
from httpx import AsyncClient

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.tests.conftest import test_session_factory
from app.utils.enums import UserRole


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient) -> None:
    """POST /api/v1/auth/login with valid credentials should return tokens."""
    # Seed a user directly into the test database
    async with test_session_factory() as session:
        repo = UserRepository(session)
        await repo.create(
            email="admin@test.dz",
            hashed_password=hash_password("password123"),
            full_name="Test Admin",
            role=UserRole.SUPER_ADMIN,
            is_superuser=True,
        )
        await session.commit()

    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.dz", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient) -> None:
    """POST /api/v1/auth/login with wrong password should return 401."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@test.dz", "password": "wrongpass"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_health_requires_no_auth(client: AsyncClient) -> None:
    """The /health endpoint should be accessible without authentication."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
