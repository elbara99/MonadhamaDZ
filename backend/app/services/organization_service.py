from __future__ import annotations

import uuid

from app.repositories.base import PaginatedResult
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.organization import OrganizationCreate, OrganizationQuery, OrganizationRead, OrganizationUpdate


class OrganizationNotFoundError(Exception):
    pass


class OrganizationCodeExistsError(Exception):
    pass


class OrganizationService:
    def __init__(self, repo: OrganizationRepository) -> None:
        self._repo = repo

    async def create(self, payload: OrganizationCreate) -> OrganizationRead:
        existing = await self._repo.get_by_code(payload.code)
        if existing:
            raise OrganizationCodeExistsError(f"Organization code '{payload.code}' already exists")
        instance = await self._repo.create(**payload.model_dump())
        return OrganizationRead.model_validate(instance)

    async def get(self, pk: uuid.UUID) -> OrganizationRead:
        instance = await self._repo.get(pk)
        if instance is None:
            raise OrganizationNotFoundError(f"Organization {pk} not found")
        return OrganizationRead.model_validate(instance)

    async def update(self, pk: uuid.UUID, payload: OrganizationUpdate) -> OrganizationRead:
        instance = await self._repo.get(pk)
        if instance is None:
            raise OrganizationNotFoundError(f"Organization {pk} not found")
        update_data = payload.model_dump(exclude_unset=True, exclude_none=True)
        if not update_data:
            return OrganizationRead.model_validate(instance)
        updated = await self._repo.update(pk, **update_data)
        return OrganizationRead.model_validate(updated)

    async def delete(self, pk: uuid.UUID) -> None:
        instance = await self._repo.get(pk)
        if instance is None:
            raise OrganizationNotFoundError(f"Organization {pk} not found")
        await self._repo.delete(pk)

    async def list(self, query: OrganizationQuery) -> PaginatedResult[OrganizationRead]:
        filters = {}
        if query.type:
            filters["type"] = query.type
        if query.province_code:
            filters["province_code"] = query.province_code

        result = await self._repo.paginated_search(
            page=query.page,
            page_size=query.page_size,
            filters=filters,
            search=query.search,
            search_columns=["name_ar", "name_fr", "code"],
            sort_by=query.sort_by,
            sort_order=query.sort_order,
        )
        result.items = [OrganizationRead.model_validate(i) for i in result.items]
        return result
