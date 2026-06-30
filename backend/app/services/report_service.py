from __future__ import annotations

import uuid

from app.repositories.base import PaginatedResult
from app.repositories.report_repository import ReportRepository
from app.schemas.report import ReportCreate, ReportQuery, ReportRead, ReportUpdate


class ReportNotFoundError(Exception):
    pass


class ReportService:
    def __init__(self, repo: ReportRepository) -> None:
        self._repo = repo

    async def create(self, payload: ReportCreate) -> ReportRead:
        data = payload.model_dump()
        if data.get("organization_id"):
            data["organization_id"] = uuid.UUID(str(data["organization_id"]))
        instance = await self._repo.create(**data)
        return ReportRead.model_validate(instance)

    async def get(self, pk: uuid.UUID) -> ReportRead:
        instance = await self._repo.get(pk)
        if instance is None:
            raise ReportNotFoundError(f"Report {pk} not found")
        return ReportRead.model_validate(instance)

    async def update(self, pk: uuid.UUID, payload: ReportUpdate) -> ReportRead:
        instance = await self._repo.get(pk)
        if instance is None:
            raise ReportNotFoundError(f"Report {pk} not found")
        update_data = payload.model_dump(exclude_unset=True, exclude_none=True)
        if update_data.get("organization_id"):
            update_data["organization_id"] = uuid.UUID(str(update_data["organization_id"]))
        if not update_data:
            return ReportRead.model_validate(instance)
        updated = await self._repo.update(pk, **update_data)
        return ReportRead.model_validate(updated)

    async def delete(self, pk: uuid.UUID) -> None:
        instance = await self._repo.get(pk)
        if instance is None:
            raise ReportNotFoundError(f"Report {pk} not found")
        await self._repo.delete(pk)

    async def list(self, query: ReportQuery) -> PaginatedResult[ReportRead]:
        filters = {}
        if query.organization_id:
            filters["organization_id"] = uuid.UUID(str(query.organization_id))

        result = await self._repo.paginated_search(
            page=query.page,
            page_size=query.page_size,
            filters=filters,
            search=query.search,
            search_columns=["title", "description"],
            sort_by=query.sort_by,
            sort_order=query.sort_order,
        )
        result.items = [ReportRead.model_validate(i) for i in result.items]
        return result
