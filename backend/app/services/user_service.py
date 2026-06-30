from __future__ import annotations

import uuid

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserRead, UserUpdate


class UserNotFoundError(Exception):
    """Raised when a requested user does not exist."""


class DuplicateEmailError(Exception):
    """Raised when attempting to create a user with an existing email."""


class UserService:
    """Service for user administration: create, read, update, delete, list."""

    def __init__(self, user_repository: UserRepository) -> None:
        self._repo = user_repository

    async def create_user(self, payload: UserCreate) -> UserRead:
        """Register a new user. Raises DuplicateEmailError if the email is taken."""
        existing = await self._repo.find_by_email(payload.email)
        if existing is not None:
            raise DuplicateEmailError(f"Email '{payload.email}' is already registered")

        hashed = hash_password(payload.password)
        user = await self._repo.create(
            email=payload.email,
            hashed_password=hashed,
            full_name=payload.full_name,
            role=payload.role,
            province_id=payload.province_id,
        )
        return UserRead.model_validate(user)

    async def get_user(self, user_id: uuid.UUID) -> UserRead:
        """Return a user by ID. Raises UserNotFoundError if absent."""
        user = await self._repo.get(user_id)
        if user is None:
            raise UserNotFoundError(f"User {user_id} not found")
        return UserRead.model_validate(user)

    async def update_user(self, user_id: uuid.UUID, payload: UserUpdate) -> UserRead:
        """Partially update a user. Raises UserNotFoundError if absent."""
        user = await self._repo.get(user_id)
        if user is None:
            raise UserNotFoundError(f"User {user_id} not found")

        update_data = payload.model_dump(exclude_unset=True, exclude_none=True)
        if not update_data:
            return UserRead.model_validate(user)

        updated = await self._repo.update(user_id, **update_data)
        return UserRead.model_validate(updated)

    async def list_users(self) -> list[UserRead]:
        """Return all active users."""
        users = await self._repo.list_all()
        return [UserRead.model_validate(u) for u in users]

    async def deactivate_user(self, user_id: uuid.UUID) -> None:
        """Soft-delete a user by marking them inactive."""
        user = await self._repo.get(user_id)
        if user is None:
            raise UserNotFoundError(f"User {user_id} not found")
        await self._repo.update(user_id, is_active=False)
