from __future__ import annotations

import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_token
from app.repositories.user_repository import UserRepository
from app.utils.enums import Permission, UserRole

_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> uuid.UUID:
    """Extract and validate the current user's ID from the JWT access token."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_token(credentials.credentials)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is not an access token",
        )

    sub = payload.get("sub")
    if sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    return uuid.UUID(sub)


async def get_current_user_role(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> UserRole:
    """Extract the current user's role from the JWT access token."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )
    try:
        payload = decode_token(credentials.credentials)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    role_str = payload.get("role")
    if role_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing role claim",
        )
    return UserRole(role_str)


def require_permission(required: Permission):
    """Dependency factory: returns a dependency that checks for a specific permission.

    Usage:
        @router.get("/protected")
        async def protected(_: None = Depends(require_permission(Permission.USER_READ))):
            ...
    """

    async def _check_permission(current_role: UserRole = Depends(get_current_user_role)) -> None:
        from app.utils.enums import ROLE_PERMISSIONS

        permissions = ROLE_PERMISSIONS.get(current_role, set())
        if required not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {required.value}",
            )

    return _check_permission


async def get_user_repository(
    session: AsyncSession = Depends(get_db),
) -> UserRepository:
    """Dependency that provides a UserRepository instance."""
    return UserRepository(session)
