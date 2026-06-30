from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Data-access layer for the User entity."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, User)

    async def find_by_email(self, email: str) -> User | None:
        """Retrieve a user by their email address."""
        return await self.find_one(email=email)
