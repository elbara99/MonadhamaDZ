from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.report import Report
from app.repositories.base import BaseRepository


class ReportRepository(BaseRepository[Report]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Report)
