from __future__ import annotations

import uuid

from jose import JWTError

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginResponse, TokenRefreshResponse
from app.utils.enums import UserRole


class AuthenticationError(Exception):
    """Raised when authentication credentials are invalid."""


class AuthorizationError(Exception):
    """Raised when the user lacks the required permissions."""


class AuthService:
    """Service responsible for authentication and token management."""

    def __init__(self, user_repository: UserRepository) -> None:
        self._user_repo = user_repository

    async def authenticate(self, email: str, password: str) -> LoginResponse:
        """Validate credentials and return JWT token pair.

        Raises AuthenticationError if credentials are invalid or the user is inactive.
        """
        user = await self._user_repo.find_by_email(email)
        if user is None:
            raise AuthenticationError("Invalid email or password")
        if not user.is_active:
            raise AuthenticationError("Account is deactivated")

        if not verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")

        extra_claims = {
            "role": user.role,
            "email": user.email,
        }
        access_token = create_access_token(subject=user.id, extra_claims=extra_claims)
        refresh_token = create_refresh_token(subject=user.id)

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def refresh_access_token(self, refresh_token: str) -> TokenRefreshResponse:
        """Validate a refresh token and issue a new access token."""
        try:
            payload = decode_token(refresh_token)
        except JWTError:
            raise AuthenticationError("Invalid or expired refresh token")

        if payload.get("type") != "refresh":
            raise AuthenticationError("Token is not a refresh token")

        user_id = payload.get("sub")
        if user_id is None:
            raise AuthenticationError("Invalid token payload")

        user = await self._user_repo.get(uuid.UUID(user_id))
        if user is None or not user.is_active:
            raise AuthenticationError("User not found or inactive")

        extra_claims = {
            "role": user.role,
            "email": user.email,
        }
        access_token = create_access_token(subject=user.id, extra_claims=extra_claims)
        return TokenRefreshResponse(access_token=access_token)
