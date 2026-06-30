from __future__ import annotations

from pydantic import BaseModel, Field


class ProvinceCreate(BaseModel):
    code: str = Field(..., pattern=r"^DZ-\d{2}$", description="Province code DZ-XX")
    name_ar: str = Field(..., min_length=1, max_length=100)
    name_fr: str = Field(..., min_length=1, max_length=100)
    population: int = Field(..., ge=0)
    area: float = Field(..., gt=0)
    region: str = Field(..., min_length=1, max_length=50)


class ProvinceUpdate(BaseModel):
    name_ar: str | None = Field(None, min_length=1, max_length=100)
    name_fr: str | None = Field(None, min_length=1, max_length=100)
    population: int | None = Field(None, ge=0)
    area: float | None = Field(None, gt=0)
    region: str | None = Field(None, min_length=1, max_length=50)


class ProvinceRead(BaseModel):
    code: str
    name_ar: str
    name_fr: str
    population: int
    area: float
    region: str

    model_config = {"from_attributes": True}


class ProvinceQuery(BaseModel):
    region: str | None = None
    search: str | None = Field(None, description="Search name_ar or name_fr")
    sort_by: str = "code"
    sort_order: str = "asc"
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
