from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.province import Province
from app.repositories.base import BaseRepository


class ProvinceRepository(BaseRepository[Province]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Province)

    async def get_by_code(self, code: str) -> Province | None:
        return await self.find_one(code=code)
