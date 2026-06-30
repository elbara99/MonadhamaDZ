from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class OrganizationCreate(BaseModel):
    code: str = Field(..., min_length=1, max_length=20)
    name_ar: str = Field(..., min_length=1, max_length=200)
    name_fr: str = Field(..., min_length=1, max_length=200)
    type: str = Field(..., pattern=r"^(ministry|department|institution|municipality)$")
    province_code: str | None = Field(None, pattern=r"^DZ-\d{2}$")


class OrganizationUpdate(BaseModel):
    name_ar: str | None = Field(None, min_length=1, max_length=200)
    name_fr: str | None = Field(None, min_length=1, max_length=200)
    type: str | None = Field(None, pattern=r"^(ministry|department|institution|municipality)$")
    province_code: str | None = Field(None, pattern=r"^DZ-\d{2}$")


class OrganizationRead(BaseModel):
    id: uuid.UUID
    code: str
    name_ar: str
    name_fr: str
    type: str
    province_code: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrganizationQuery(BaseModel):
    type: str | None = None
    province_code: str | None = None
    search: str | None = None
    sort_by: str = "code"
    sort_order: str = "asc"
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
