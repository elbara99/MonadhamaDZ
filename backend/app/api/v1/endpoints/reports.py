from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import require_permission
from app.dependencies.repositories import get_report_repository
from app.repositories.report_repository import ReportRepository
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.report import ReportCreate, ReportRead, ReportUpdate
from app.services.report_service import ReportNotFoundError, ReportService
from app.utils.enums import Permission

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("", response_model=ReportRead, status_code=status.HTTP_201_CREATED)
async def create_report(
    body: ReportCreate,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: ReportRepository = Depends(get_report_repository),
) -> ReportRead:
    return await ReportService(repo).create(body)


@router.get("", response_model=PaginatedResponse[ReportRead])
async def list_reports(
    organization_id: str | None = Query(None),
    search: str | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    repo: ReportRepository = Depends(get_report_repository),
) -> PaginatedResponse[ReportRead]:
    from app.schemas.report import ReportQuery
    query = ReportQuery(organization_id=organization_id, search=search, sort_by=sort_by, sort_order=sort_order, page=page, page_size=page_size)
    result = await ReportService(repo).list(query)
    return PaginatedResponse(items=result.items, total=result.total, page=result.page, page_size=result.page_size, total_pages=result.total_pages)


@router.get("/{pk}", response_model=ReportRead)
async def get_report(
    pk: uuid.UUID,
    repo: ReportRepository = Depends(get_report_repository),
) -> ReportRead:
    try:
        return await ReportService(repo).get(pk)
    except ReportNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{pk}", response_model=ReportRead)
async def update_report(
    pk: uuid.UUID,
    body: ReportUpdate,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: ReportRepository = Depends(get_report_repository),
) -> ReportRead:
    try:
        return await ReportService(repo).update(pk, body)
    except ReportNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{pk}", response_model=MessageResponse)
async def delete_report(
    pk: uuid.UUID,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: ReportRepository = Depends(get_report_repository),
) -> MessageResponse:
    try:
        await ReportService(repo).delete(pk)
        return MessageResponse(message="Report deleted", code="OK")
    except ReportNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
