from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pis_alert import PISAlert
from app.models.pis_config import PISConfig
from app.models.pis_recommendation import PISRecommendation
from app.models.pis_score import PISScore
from app.models.pis_snapshot import PISSnapshot
from app.repositories.base import BaseRepository


class PISConfigRepository(BaseRepository[PISConfig]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PISConfig)

    async def get_by_dimension(self, dimension: str) -> PISConfig | None:
        return await self.find_one(dimension=dimension)

    async def list_all_ordered(self) -> list[PISConfig]:
        return await self.list_all(order_by="dimension")


class PISScoreRepository(BaseRepository[PISScore]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PISScore)

    async def get_latest(self, province_code: str) -> PISScore | None:
        result = await self.paginated_search(
            filters={"province_code": province_code},
            sort_by="year", sort_order="desc", page=1, page_size=1,
        )
        return result.items[0] if result.items else None

    async def list_by_province(self, province_code: str) -> list[PISScore]:
        return await self.list_all(province_code=province_code, order_by="-year")

    async def get_all_ordered_by_score(self) -> list[PISScore]:
        return await self.list_all(order_by="-composite_score")

    async def get_latest_per_province(self) -> list[PISScore]:
        from sqlalchemy import func as sa_func, select as sa_select, and_
        subq = (
            sa_select(
                PISScore.province_code,
                sa_func.max(PISScore.year).label("max_year"),
                sa_func.max(PISScore.quarter).label("max_quarter"),
            )
            .group_by(PISScore.province_code)
            .subquery()
        )
        stmt = sa_select(PISScore).join(
            subq,
            and_(
                PISScore.province_code == subq.c.province_code,
                PISScore.year == subq.c.max_year,
                PISScore.quarter == subq.c.max_quarter,
            ),
        )
        result = await self._session.execute(stmt)
        return list(result.scalars().all())


class PISSnapshotRepository(BaseRepository[PISSnapshot]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PISSnapshot)

    async def list_by_province(self, province_code: str, limit: int = 20) -> list[PISSnapshot]:
        result = await self.paginated_search(
            filters={"province_code": province_code},
            sort_by="snapshot_date", sort_order="desc", page=1, page_size=limit,
        )
        return result.items

    async def get_trend_data(self, limit: int = 12) -> list[PISSnapshot]:
        return await self.list_all(order_by="-snapshot_date")


class PISAlertRepository(BaseRepository[PISAlert]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PISAlert)

    async def list_active(self, province_code: str | None = None) -> list[PISAlert]:
        filters: dict = {"resolved": False}
        if province_code:
            filters["province_code"] = province_code
        return await self.list_all(**filters, order_by="-created_at")

    async def resolve_all(self, province_code: str | None = None) -> None:
        filters: dict = {"resolved": False}
        if province_code:
            filters["province_code"] = province_code
        alerts = await self.list_all(**filters)
        for alert in alerts:
            alert.resolved = True


class PISRecommendationRepository(BaseRepository[PISRecommendation]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, PISRecommendation)

    async def list_by_province(self, province_code: str) -> list[PISRecommendation]:
        return await self.list_all(province_code=province_code, order_by="-priority")

    async def list_pending(self) -> list[PISRecommendation]:
        return await self.list_all(implemented=False, order_by="-priority")
