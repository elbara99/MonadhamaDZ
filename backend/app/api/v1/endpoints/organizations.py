from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import require_permission
from app.dependencies.repositories import get_organization_repository
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.organization import OrganizationCreate, OrganizationRead, OrganizationUpdate
from app.services.organization_service import OrganizationCodeExistsError, OrganizationNotFoundError, OrganizationService
from app.utils.enums import Permission

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("", response_model=OrganizationRead, status_code=status.HTTP_201_CREATED)
async def create_organization(
    body: OrganizationCreate,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: OrganizationRepository = Depends(get_organization_repository),
) -> OrganizationRead:
    try:
        return await OrganizationService(repo).create(body)
    except OrganizationCodeExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("", response_model=PaginatedResponse[OrganizationRead])
async def list_organizations(
    type: str | None = Query(None),
    province_code: str | None = Query(None),
    search: str | None = Query(None),
    sort_by: str = Query("code"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    repo: OrganizationRepository = Depends(get_organization_repository),
) -> PaginatedResponse[OrganizationRead]:
    from app.schemas.organization import OrganizationQuery
    query = OrganizationQuery(type=type, province_code=province_code, search=search, sort_by=sort_by, sort_order=sort_order, page=page, page_size=page_size)
    result = await OrganizationService(repo).list(query)
    return PaginatedResponse(items=result.items, total=result.total, page=result.page, page_size=result.page_size, total_pages=result.total_pages)


@router.get("/{pk}", response_model=OrganizationRead)
async def get_organization(
    pk: uuid.UUID,
    repo: OrganizationRepository = Depends(get_organization_repository),
) -> OrganizationRead:
    try:
        return await OrganizationService(repo).get(pk)
    except OrganizationNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{pk}", response_model=OrganizationRead)
async def update_organization(
    pk: uuid.UUID,
    body: OrganizationUpdate,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: OrganizationRepository = Depends(get_organization_repository),
) -> OrganizationRead:
    try:
        return await OrganizationService(repo).update(pk, body)
    except OrganizationNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{pk}", response_model=MessageResponse)
async def delete_organization(
    pk: uuid.UUID,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: OrganizationRepository = Depends(get_organization_repository),
) -> MessageResponse:
    try:
        await OrganizationService(repo).delete(pk)
        return MessageResponse(message="Organization deleted", code="OK")
    except OrganizationNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
