from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import (
    get_current_user_id,
    get_current_user_role,
    get_user_repository,
    require_permission,
)
from app.repositories.user_repository import UserRepository
from app.schemas.common import MessageResponse
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.user_service import DuplicateEmailError, UserNotFoundError, UserService
from app.utils.enums import Permission, UserRole

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    _: None = Depends(require_permission(Permission.USER_CREATE)),
    user_repo: UserRepository = Depends(get_user_repository),
) -> UserRead:
    """Register a new user. Requires the user:create permission."""
    service = UserService(user_repo)
    try:
        return await service.create_user(body)
    except DuplicateEmailError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )


@router.get("", response_model=list[UserRead])
async def list_users(
    _: None = Depends(require_permission(Permission.USER_LIST)),
    user_repo: UserRepository = Depends(get_user_repository),
) -> list[UserRead]:
    """Return all users. Requires the user:list permission."""
    service = UserService(user_repo)
    return await service.list_users()


@router.get("/me", response_model=UserRead)
async def get_current_user(
    user_id: uuid.UUID = Depends(get_current_user_id),
    user_repo: UserRepository = Depends(get_user_repository),
) -> UserRead:
    """Return the profile of the currently authenticated user."""
    service = UserService(user_repo)
    try:
        return await service.get_user(user_id)
    except UserNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: uuid.UUID,
    _: None = Depends(require_permission(Permission.USER_READ)),
    user_repo: UserRepository = Depends(get_user_repository),
) -> UserRead:
    """Return a specific user by ID. Requires the user:read permission."""
    service = UserService(user_repo)
    try:
        return await service.get_user(user_id)
    except UserNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: uuid.UUID,
    body: UserUpdate,
    _: None = Depends(require_permission(Permission.USER_UPDATE)),
    user_repo: UserRepository = Depends(get_user_repository),
) -> UserRead:
    """Update a user's attributes. Requires the user:update permission."""
    service = UserService(user_repo)
    try:
        return await service.update_user(user_id, body)
    except UserNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )


@router.delete("/{user_id}", response_model=MessageResponse)
async def deactivate_user(
    user_id: uuid.UUID,
    _: None = Depends(require_permission(Permission.USER_DELETE)),
    user_repo: UserRepository = Depends(get_user_repository),
) -> MessageResponse:
    """Soft-delete a user by marking them inactive. Requires the user:delete permission."""
    service = UserService(user_repo)
    try:
        await service.deactivate_user(user_id)
        return MessageResponse(message="User deactivated successfully", code="OK")
    except UserNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
