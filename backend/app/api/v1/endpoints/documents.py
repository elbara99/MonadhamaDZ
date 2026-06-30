from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import require_permission
from app.dependencies.repositories import get_document_repository
from app.repositories.document_repository import DocumentRepository
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.document import DocumentCreate, DocumentRead, DocumentUpdate
from app.services.document_service import DocumentNotFoundError, DocumentService
from app.utils.enums import Permission

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def create_document(
    body: DocumentCreate,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: DocumentRepository = Depends(get_document_repository),
) -> DocumentRead:
    return await DocumentService(repo).create(body)


@router.get("", response_model=PaginatedResponse[DocumentRead])
async def list_documents(
    document_type: str | None = Query(None),
    organization_id: str | None = Query(None),
    project_id: str | None = Query(None),
    search: str | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    repo: DocumentRepository = Depends(get_document_repository),
) -> PaginatedResponse[DocumentRead]:
    from app.schemas.document import DocumentQuery
    query = DocumentQuery(document_type=document_type, organization_id=organization_id, project_id=project_id, search=search, sort_by=sort_by, sort_order=sort_order, page=page, page_size=page_size)
    result = await DocumentService(repo).list(query)
    return PaginatedResponse(items=result.items, total=result.total, page=result.page, page_size=result.page_size, total_pages=result.total_pages)


@router.get("/{pk}", response_model=DocumentRead)
async def get_document(
    pk: uuid.UUID,
    repo: DocumentRepository = Depends(get_document_repository),
) -> DocumentRead:
    try:
        return await DocumentService(repo).get(pk)
    except DocumentNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{pk}", response_model=DocumentRead)
async def update_document(
    pk: uuid.UUID,
    body: DocumentUpdate,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: DocumentRepository = Depends(get_document_repository),
) -> DocumentRead:
    try:
        return await DocumentService(repo).update(pk, body)
    except DocumentNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{pk}", response_model=MessageResponse)
async def delete_document(
    pk: uuid.UUID,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: DocumentRepository = Depends(get_document_repository),
) -> MessageResponse:
    try:
        await DocumentService(repo).delete(pk)
        return MessageResponse(message="Document deleted", code="OK")
    except DocumentNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
