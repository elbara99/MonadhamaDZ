from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class IndicatorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    value: float = Field(...)
    target: float | None = None
    unit: str = Field(..., min_length=1, max_length=50)
    year: int = Field(..., ge=2000, le=2100)
    province_code: str = Field(..., pattern=r"^DZ-\d{2}$")
    dimension: str | None = Field(None, max_length=50)


class IndicatorUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    value: float | None = None
    target: float | None = None
    unit: str | None = Field(None, min_length=1, max_length=50)
    year: int | None = Field(None, ge=2000, le=2100)
    dimension: str | None = None


class IndicatorRead(BaseModel):
    id: uuid.UUID
    name: str
    value: float
    target: float | None
    unit: str
    year: int
    province_code: str
    dimension: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class IndicatorQuery(BaseModel):
    province_code: str | None = None
    year: int | None = None
    search: str | None = None
    sort_by: str = "year"
    sort_order: str = "desc"
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
