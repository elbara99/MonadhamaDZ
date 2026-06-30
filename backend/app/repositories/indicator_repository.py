from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.indicator import Indicator
from app.repositories.base import BaseRepository


class IndicatorRepository(BaseRepository[Indicator]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Indicator)
