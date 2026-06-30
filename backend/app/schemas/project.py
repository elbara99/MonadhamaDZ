from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    description: str | None = None
    organization_id: str | uuid.UUID | None = None
    province_code: str | None = Field(None, pattern=r"^DZ-\d{2}$")
    budget: float | None = Field(None, ge=0)
    status: str = Field("planned", pattern=r"^(planned|in_progress|completed|on_hold|cancelled)$")
    start_date: date | None = None
    end_date: date | None = None


class ProjectUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=300)
    description: str | None = None
    organization_id: str | uuid.UUID | None = None
    province_code: str | None = Field(None, pattern=r"^DZ-\d{2}$")
    budget: float | None = Field(None, ge=0)
    status: str | None = Field(None, pattern=r"^(planned|in_progress|completed|on_hold|cancelled)$")
    start_date: date | None = None
    end_date: date | None = None


class ProjectRead(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None
    organization_id: uuid.UUID | None
    province_code: str | None
    budget: float | None
    status: str
    start_date: date | None
    end_date: date | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectQuery(BaseModel):
    status: str | None = None
    province_code: str | None = None
    organization_id: str | uuid.UUID | None = None
    search: str | None = None
    sort_by: str = "created_at"
    sort_order: str = "desc"
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
