from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import require_permission
from app.dependencies.repositories import get_indicator_repository
from app.repositories.indicator_repository import IndicatorRepository
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.indicator import IndicatorCreate, IndicatorRead, IndicatorUpdate
from app.services.indicator_service import IndicatorNotFoundError, IndicatorService
from app.utils.enums import Permission

router = APIRouter(prefix="/indicators", tags=["Indicators"])


@router.post("", response_model=IndicatorRead, status_code=status.HTTP_201_CREATED)
async def create_indicator(
    body: IndicatorCreate,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: IndicatorRepository = Depends(get_indicator_repository),
) -> IndicatorRead:
    return await IndicatorService(repo).create(body)


@router.get("", response_model=PaginatedResponse[IndicatorRead])
async def list_indicators(
    province_code: str | None = Query(None),
    year: int | None = Query(None),
    search: str | None = Query(None),
    sort_by: str = Query("year"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    repo: IndicatorRepository = Depends(get_indicator_repository),
) -> PaginatedResponse[IndicatorRead]:
    from app.schemas.indicator import IndicatorQuery
    query = IndicatorQuery(province_code=province_code, year=year, search=search, sort_by=sort_by, sort_order=sort_order, page=page, page_size=page_size)
    result = await IndicatorService(repo).list(query)
    return PaginatedResponse(items=result.items, total=result.total, page=result.page, page_size=result.page_size, total_pages=result.total_pages)


@router.get("/{pk}", response_model=IndicatorRead)
async def get_indicator(
    pk: uuid.UUID,
    repo: IndicatorRepository = Depends(get_indicator_repository),
) -> IndicatorRead:
    try:
        return await IndicatorService(repo).get(pk)
    except IndicatorNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{pk}", response_model=IndicatorRead)
async def update_indicator(
    pk: uuid.UUID,
    body: IndicatorUpdate,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: IndicatorRepository = Depends(get_indicator_repository),
) -> IndicatorRead:
    try:
        return await IndicatorService(repo).update(pk, body)
    except IndicatorNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{pk}", response_model=MessageResponse)
async def delete_indicator(
    pk: uuid.UUID,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: IndicatorRepository = Depends(get_indicator_repository),
) -> MessageResponse:
    try:
        await IndicatorService(repo).delete(pk)
        return MessageResponse(message="Indicator deleted", code="OK")
    except IndicatorNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
