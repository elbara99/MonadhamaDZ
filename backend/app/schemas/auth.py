from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Request body for user authentication."""

    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=8, max_length=128, description="Account password")


class LoginResponse(BaseModel):
    """Response returned on successful authentication."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    """Request body to obtain a new access token via refresh token."""

    refresh_token: str


class TokenRefreshResponse(BaseModel):
    """Response returned on successful token refresh."""

    access_token: str
    token_type: str = "bearer"
