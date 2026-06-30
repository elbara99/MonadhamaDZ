from __future__ import annotations

from app.repositories.base import PaginatedResult
from app.repositories.province_repository import ProvinceRepository
from app.schemas.province import ProvinceCreate, ProvinceQuery, ProvinceRead, ProvinceUpdate


class ProvinceNotFoundError(Exception):
    pass


class ProvinceCodeExistsError(Exception):
    pass


class ProvinceService:
    def __init__(self, repo: ProvinceRepository) -> None:
        self._repo = repo

    async def create(self, payload: ProvinceCreate) -> ProvinceRead:
        existing = await self._repo.get_by_code(payload.code)
        if existing:
            raise ProvinceCodeExistsError(f"Province '{payload.code}' already exists")
        instance = await self._repo.create(**payload.model_dump())
        return ProvinceRead.model_validate(instance)

    async def get(self, code: str) -> ProvinceRead:
        instance = await self._repo.get_by_code(code)
        if instance is None:
            raise ProvinceNotFoundError(f"Province '{code}' not found")
        return ProvinceRead.model_validate(instance)

    async def update(self, code: str, payload: ProvinceUpdate) -> ProvinceRead:
        instance = await self._repo.get_by_code(code)
        if instance is None:
            raise ProvinceNotFoundError(f"Province '{code}' not found")
        update_data = payload.model_dump(exclude_unset=True, exclude_none=True)
        if not update_data:
            return ProvinceRead.model_validate(instance)
        updated = await self._repo.update(instance.code, **update_data)
        return ProvinceRead.model_validate(updated)

    async def delete(self, code: str) -> None:
        instance = await self._repo.get_by_code(code)
        if instance is None:
            raise ProvinceNotFoundError(f"Province '{code}' not found")
        await self._repo.delete(instance.code)

    async def list(self, query: ProvinceQuery) -> PaginatedResult[ProvinceRead]:
        filters = {}
        if query.region:
            filters["region"] = query.region

        result = await self._repo.paginated_search(
            page=query.page,
            page_size=query.page_size,
            filters=filters,
            search=query.search,
            search_columns=["name_ar", "name_fr"],
            sort_by=query.sort_by,
            sort_order=query.sort_order,
        )
        result.items = [ProvinceRead.model_validate(i) for i in result.items]
        return result
