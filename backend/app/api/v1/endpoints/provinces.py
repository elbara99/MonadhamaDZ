from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import require_permission
from app.dependencies.repositories import get_province_repository
from app.repositories.province_repository import ProvinceRepository
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.province import ProvinceCreate, ProvinceRead, ProvinceUpdate
from app.services.province_service import ProvinceCodeExistsError, ProvinceNotFoundError, ProvinceService
from app.utils.enums import Permission

router = APIRouter(prefix="/provinces", tags=["Provinces"])


@router.post("", response_model=ProvinceRead, status_code=status.HTTP_201_CREATED)
async def create_province(
    body: ProvinceCreate,
    _: None = Depends(require_permission(Permission.PROVINCE_UPDATE)),
    repo: ProvinceRepository = Depends(get_province_repository),
) -> ProvinceRead:
    svc = ProvinceService(repo)
    try:
        return await svc.create(body)
    except ProvinceCodeExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("", response_model=PaginatedResponse[ProvinceRead])
async def list_provinces(
    region: str | None = Query(None),
    search: str | None = Query(None),
    sort_by: str = Query("code"),
    sort_order: str = Query("asc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    repo: ProvinceRepository = Depends(get_province_repository),
) -> PaginatedResponse[ProvinceRead]:
    from app.schemas.province import ProvinceQuery
    query = ProvinceQuery(region=region, search=search, sort_by=sort_by, sort_order=sort_order, page=page, page_size=page_size)
    result = await ProvinceService(repo).list(query)
    return PaginatedResponse(items=result.items, total=result.total, page=result.page, page_size=result.page_size, total_pages=result.total_pages)


@router.get("/{code}", response_model=ProvinceRead)
async def get_province(
    code: str,
    repo: ProvinceRepository = Depends(get_province_repository),
) -> ProvinceRead:
    try:
        return await ProvinceService(repo).get(code)
    except ProvinceNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{code}", response_model=ProvinceRead)
async def update_province(
    code: str,
    body: ProvinceUpdate,
    _: None = Depends(require_permission(Permission.PROVINCE_UPDATE)),
    repo: ProvinceRepository = Depends(get_province_repository),
) -> ProvinceRead:
    try:
        return await ProvinceService(repo).update(code, body)
    except ProvinceNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{code}", response_model=MessageResponse)
async def delete_province(
    code: str,
    _: None = Depends(require_permission(Permission.PROVINCE_UPDATE)),
    repo: ProvinceRepository = Depends(get_province_repository),
) -> MessageResponse:
    try:
        await ProvinceService(repo).delete(code)
        return MessageResponse(message="Province deleted", code="OK")
    except ProvinceNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
