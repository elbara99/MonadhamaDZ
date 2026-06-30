from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: str | None = None
    generated_at: datetime | None = None
    organization_id: str | uuid.UUID | None = None


class ReportUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=300)
    description: str | None = None
    generated_at: datetime | None = None
    organization_id: str | uuid.UUID | None = None


class ReportRead(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    generated_at: datetime | None
    organization_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReportQuery(BaseModel):
    organization_id: str | uuid.UUID | None = None
    search: str | None = None
    sort_by: str = "created_at"
    sort_order: str = "desc"
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
