from __future__ import annotations

import uuid

from app.repositories.base import PaginatedResult
from app.repositories.document_repository import DocumentRepository
from app.schemas.document import DocumentCreate, DocumentQuery, DocumentRead, DocumentUpdate


class DocumentNotFoundError(Exception):
    pass


class DocumentService:
    def __init__(self, repo: DocumentRepository) -> None:
        self._repo = repo

    async def create(self, payload: DocumentCreate) -> DocumentRead:
        data = payload.model_dump()
        for fk in ("organization_id", "project_id"):
            if data.get(fk):
                data[fk] = uuid.UUID(str(data[fk]))
        instance = await self._repo.create(**data)
        return DocumentRead.model_validate(instance)

    async def get(self, pk: uuid.UUID) -> DocumentRead:
        instance = await self._repo.get(pk)
        if instance is None:
            raise DocumentNotFoundError(f"Document {pk} not found")
        return DocumentRead.model_validate(instance)

    async def update(self, pk: uuid.UUID, payload: DocumentUpdate) -> DocumentRead:
        instance = await self._repo.get(pk)
        if instance is None:
            raise DocumentNotFoundError(f"Document {pk} not found")
        update_data = payload.model_dump(exclude_unset=True, exclude_none=True)
        for fk in ("organization_id", "project_id"):
            if update_data.get(fk):
                update_data[fk] = uuid.UUID(str(update_data[fk]))
        if not update_data:
            return DocumentRead.model_validate(instance)
        updated = await self._repo.update(pk, **update_data)
        return DocumentRead.model_validate(updated)

    async def delete(self, pk: uuid.UUID) -> None:
        instance = await self._repo.get(pk)
        if instance is None:
            raise DocumentNotFoundError(f"Document {pk} not found")
        await self._repo.delete(pk)

    async def list(self, query: DocumentQuery) -> PaginatedResult[DocumentRead]:
        filters = {}
        if query.document_type:
            filters["document_type"] = query.document_type
        if query.organization_id:
            filters["organization_id"] = uuid.UUID(str(query.organization_id))
        if query.project_id:
            filters["project_id"] = uuid.UUID(str(query.project_id))

        result = await self._repo.paginated_search(
            page=query.page,
            page_size=query.page_size,
            filters=filters,
            search=query.search,
            search_columns=["filename"],
            sort_by=query.sort_by,
            sort_order=query.sort_order,
        )
        result.items = [DocumentRead.model_validate(i) for i in result.items]
        return result
