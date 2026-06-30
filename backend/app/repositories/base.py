from __future__ import annotations

import uuid
from typing import Any, Generic, TypeVar

from sqlalchemy import ColumnExpressionArgument, Select, UnaryExpression, asc, desc, func, or_, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import Base

ModelT = TypeVar("ModelT", bound=Base)


class PaginatedResult(Generic[ModelT]):
    """Wrapper for paginated query results."""

    def __init__(self, items: list[ModelT], total: int, page: int, page_size: int) -> None:
        self.items = items
        self.total = total
        self.page = page
        self.page_size = page_size

    @property
    def total_pages(self) -> int:
        return max(1, (self.total + self.page_size - 1) // self.page_size)


class BaseRepository(Generic[ModelT]):
    """Generic repository providing common CRUD operations.

    Subclass for entity-specific data access logic.
    """

    def __init__(self, session: AsyncSession, model: type[ModelT]) -> None:
        self._session = session
        self._model = model

    async def create(self, **kwargs: Any) -> ModelT:
        instance = self._model(**kwargs)
        self._session.add(instance)
        await self._session.flush()
        return instance

    @property
    def _pk_column(self) -> Any:
        return list(self._model.__table__.primary_key.columns)[0]

    async def get(self, pk: Any) -> ModelT | None:
        return await self._session.get(self._model, pk)

    async def get_by_pk(self, pk: Any) -> ModelT | None:
        return await self._session.get(self._model, pk)

    async def find_one(self, **filters: Any) -> ModelT | None:
        stmt = select(self._model).filter_by(**filters).limit(1)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_all(self, order_by: str | None = None, **filters: Any) -> list[ModelT]:
        stmt = select(self._model).filter_by(**filters)
        if order_by:
            descending = order_by.startswith("-")
            col_name = order_by.lstrip("-")
            col = getattr(self._model, col_name, None)
            if col is not None:
                stmt = stmt.order_by(desc(col) if descending else asc(col))
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def update(self, pk: Any, **kwargs: Any) -> ModelT | None:
        stmt = (
            update(self._model)
            .where(self._pk_column == pk)
            .values(**kwargs)
            .returning(self._model)
        )
        result = await self._session.execute(stmt)
        await self._session.flush()
        return result.scalar_one_or_none()

    async def delete(self, pk: Any) -> bool:
        instance = await self.get(pk)
        if instance is None:
            return False
        await self._session.delete(instance)
        await self._session.flush()
        return True

    async def count(self, **filters: Any) -> int:
        stmt = select(func.count()).select_from(self._model).filter_by(**filters)
        result = await self._session.execute(stmt)
        return result.scalar() or 0

    def _build_search_filter(self, search: str, search_columns: list[str]) -> ColumnExpressionArgument[bool] | None:
        if not search:
            return None
        search_pattern = f"%{search}%"
        conditions = []
        for col_name in search_columns:
            col = getattr(self._model, col_name, None)
            if col is not None:
                conditions.append(col.ilike(search_pattern))
        if not conditions:
            return None
        return or_(*conditions)

    def _build_sort(self, sort_by: str, sort_order: str) -> list[UnaryExpression[Any]]:
        col = getattr(self._model, sort_by, None)
        if col is None:
            return []
        direction = desc if sort_order.lower() == "desc" else lambda c: c.asc()
        return [direction(col)]

    async def paginated_search(
        self,
        page: int = 1,
        page_size: int = 20,
        filters: dict[str, Any] | None = None,
        search: str | None = None,
        search_columns: list[str] | None = None,
        sort_by: str | None = None,
        sort_order: str = "asc",
    ) -> PaginatedResult[ModelT]:
        base_stmt = select(self._model)

        if filters:
            for key, value in filters.items():
                if value is not None:
                    col = getattr(self._model, key, None)
                    if col is not None:
                        base_stmt = base_stmt.where(col == value)

        search_filter = self._build_search_filter(search, search_columns or [])
        if search_filter is not None:
            base_stmt = base_stmt.where(search_filter)

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await self._session.execute(count_stmt)
        total = total_result.scalar() or 0

        if sort_by:
            ordering = self._build_sort(sort_by, sort_order)
            if ordering:
                base_stmt = base_stmt.order_by(*ordering)

        offset = (page - 1) * page_size
        base_stmt = base_stmt.offset(offset).limit(page_size)

        result = await self._session.execute(base_stmt)
        items = list(result.scalars().all())

        return PaginatedResult(items=items, total=total, page=page, page_size=page_size)
