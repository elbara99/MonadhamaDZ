from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies.auth import require_permission
from app.dependencies.repositories import get_project_repository
from app.repositories.project_repository import ProjectRepository
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services.project_service import ProjectNotFoundError, ProjectService
from app.utils.enums import Permission

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreate,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: ProjectRepository = Depends(get_project_repository),
) -> ProjectRead:
    return await ProjectService(repo).create(body)


@router.get("", response_model=PaginatedResponse[ProjectRead])
async def list_projects(
    status: str | None = Query(None),
    province_code: str | None = Query(None),
    organization_id: str | None = Query(None),
    search: str | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    repo: ProjectRepository = Depends(get_project_repository),
) -> PaginatedResponse[ProjectRead]:
    from app.schemas.project import ProjectQuery
    query = ProjectQuery(status=status, province_code=province_code, organization_id=organization_id, search=search, sort_by=sort_by, sort_order=sort_order, page=page, page_size=page_size)
    result = await ProjectService(repo).list(query)
    return PaginatedResponse(items=result.items, total=result.total, page=result.page, page_size=result.page_size, total_pages=result.total_pages)


@router.get("/{pk}", response_model=ProjectRead)
async def get_project(
    pk: uuid.UUID,
    repo: ProjectRepository = Depends(get_project_repository),
) -> ProjectRead:
    try:
        return await ProjectService(repo).get(pk)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{pk}", response_model=ProjectRead)
async def update_project(
    pk: uuid.UUID,
    body: ProjectUpdate,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: ProjectRepository = Depends(get_project_repository),
) -> ProjectRead:
    try:
        return await ProjectService(repo).update(pk, body)
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{pk}", response_model=MessageResponse)
async def delete_project(
    pk: uuid.UUID,
    _: None = Depends(require_permission(Permission.REPORT_CREATE)),
    repo: ProjectRepository = Depends(get_project_repository),
) -> MessageResponse:
    try:
        await ProjectService(repo).delete(pk)
        return MessageResponse(message="Project deleted", code="OK")
    except ProjectNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
