from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth import get_user_repository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, LoginResponse, TokenRefreshRequest, TokenRefreshResponse
from app.services.auth_service import AuthenticationError, AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
async def login(
    body: LoginRequest,
    user_repo: UserRepository = Depends(get_user_repository),
) -> LoginResponse:
    """Authenticate with email and password, receiving JWT access and refresh tokens."""
    auth_service = AuthService(user_repo)
    try:
        return await auth_service.authenticate(body.email, body.password)
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/refresh", response_model=TokenRefreshResponse, status_code=status.HTTP_200_OK)
async def refresh_token(
    body: TokenRefreshRequest,
    user_repo: UserRepository = Depends(get_user_repository),
) -> TokenRefreshResponse:
    """Issue a new access token using a valid refresh token."""
    auth_service = AuthService(user_repo)
    try:
        return await auth_service.refresh_access_token(body.refresh_token)
    except AuthenticationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )
