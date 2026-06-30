from __future__ import annotations

import uuid

from app.repositories.base import PaginatedResult
from app.repositories.indicator_repository import IndicatorRepository
from app.schemas.indicator import IndicatorCreate, IndicatorQuery, IndicatorRead, IndicatorUpdate


class IndicatorNotFoundError(Exception):
    pass


class IndicatorService:
    def __init__(self, repo: IndicatorRepository) -> None:
        self._repo = repo

    async def create(self, payload: IndicatorCreate) -> IndicatorRead:
        instance = await self._repo.create(**payload.model_dump())
        return IndicatorRead.model_validate(instance)

    async def get(self, pk: uuid.UUID) -> IndicatorRead:
        instance = await self._repo.get(pk)
        if instance is None:
            raise IndicatorNotFoundError(f"Indicator {pk} not found")
        return IndicatorRead.model_validate(instance)

    async def update(self, pk: uuid.UUID, payload: IndicatorUpdate) -> IndicatorRead:
        instance = await self._repo.get(pk)
        if instance is None:
            raise IndicatorNotFoundError(f"Indicator {pk} not found")
        update_data = payload.model_dump(exclude_unset=True, exclude_none=True)
        if not update_data:
            return IndicatorRead.model_validate(instance)
        updated = await self._repo.update(pk, **update_data)
        return IndicatorRead.model_validate(updated)

    async def delete(self, pk: uuid.UUID) -> None:
        instance = await self._repo.get(pk)
        if instance is None:
            raise IndicatorNotFoundError(f"Indicator {pk} not found")
        await self._repo.delete(pk)

    async def list(self, query: IndicatorQuery) -> PaginatedResult[IndicatorRead]:
        filters = {}
        if query.province_code:
            filters["province_code"] = query.province_code
        if query.year:
            filters["year"] = query.year

        result = await self._repo.paginated_search(
            page=query.page,
            page_size=query.page_size,
            filters=filters,
            search=query.search,
            search_columns=["name"],
            sort_by=query.sort_by,
            sort_order=query.sort_order,
        )
        result.items = [IndicatorRead.model_validate(i) for i in result.items]
        return result
