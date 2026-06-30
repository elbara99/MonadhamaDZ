from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.utils.enums import UserRole


class UserCreate(BaseModel):
    """Request body for creating a new user."""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=256)
    role: UserRole = UserRole.VIEWER
    province_id: str | None = Field(None, pattern=r"^DZ-\d{2}$")


class UserUpdate(BaseModel):
    """Request body for updating an existing user. All fields optional."""

    email: EmailStr | None = None
    full_name: str | None = Field(None, min_length=1, max_length=256)
    role: UserRole | None = None
    province_id: str | None = Field(None, pattern=r"^DZ-\d{2}$")
    is_active: bool | None = None


class UserRead(BaseModel):
    """Response body representing a user."""

    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    province_id: str | None
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
