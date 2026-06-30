from __future__ import annotations

import uuid

from app.repositories.base import PaginatedResult
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectQuery, ProjectRead, ProjectUpdate


class ProjectNotFoundError(Exception):
    pass


class ProjectService:
    def __init__(self, repo: ProjectRepository) -> None:
        self._repo = repo

    async def create(self, payload: ProjectCreate) -> ProjectRead:
        data = payload.model_dump()
        if data.get("organization_id"):
            data["organization_id"] = uuid.UUID(str(data["organization_id"]))
        instance = await self._repo.create(**data)
        return ProjectRead.model_validate(instance)

    async def get(self, pk: uuid.UUID) -> ProjectRead:
        instance = await self._repo.get(pk)
        if instance is None:
            raise ProjectNotFoundError(f"Project {pk} not found")
        return ProjectRead.model_validate(instance)

    async def update(self, pk: uuid.UUID, payload: ProjectUpdate) -> ProjectRead:
        instance = await self._repo.get(pk)
        if instance is None:
            raise ProjectNotFoundError(f"Project {pk} not found")
        update_data = payload.model_dump(exclude_unset=True, exclude_none=True)
        if update_data.get("organization_id"):
            update_data["organization_id"] = uuid.UUID(str(update_data["organization_id"]))
        if not update_data:
            return ProjectRead.model_validate(instance)
        updated = await self._repo.update(pk, **update_data)
        return ProjectRead.model_validate(updated)

    async def delete(self, pk: uuid.UUID) -> None:
        instance = await self._repo.get(pk)
        if instance is None:
            raise ProjectNotFoundError(f"Project {pk} not found")
        await self._repo.delete(pk)

    async def list(self, query: ProjectQuery) -> PaginatedResult[ProjectRead]:
        filters = {}
        if query.status:
            filters["status"] = query.status
        if query.province_code:
            filters["province_code"] = query.province_code
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
        result.items = [ProjectRead.model_validate(i) for i in result.items]
        return result
