from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class DocumentCreate(BaseModel):
    filename: str = Field(..., min_length=1, max_length=512)
    file_path: str = Field(..., min_length=1, max_length=1024)
    mime_type: str = Field(..., min_length=1, max_length=128)
    size: int = Field(..., ge=0)
    document_type: str = Field(..., pattern=r"^(report|contract|policy|study|budget|other)$")
    organization_id: str | uuid.UUID | None = None
    project_id: str | uuid.UUID | None = None


class DocumentUpdate(BaseModel):
    filename: str | None = Field(None, min_length=1, max_length=512)
    file_path: str | None = Field(None, min_length=1, max_length=1024)
    mime_type: str | None = Field(None, min_length=1, max_length=128)
    size: int | None = Field(None, ge=0)
    document_type: str | None = Field(None, pattern=r"^(report|contract|policy|study|budget|other)$")
    organization_id: str | uuid.UUID | None = None
    project_id: str | uuid.UUID | None = None


class DocumentRead(BaseModel):
    id: uuid.UUID
    filename: str
    file_path: str
    mime_type: str
    size: int
    document_type: str
    organization_id: uuid.UUID | None
    project_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentQuery(BaseModel):
    document_type: str | None = None
    organization_id: str | uuid.UUID | None = None
    project_id: str | uuid.UUID | None = None
    search: str | None = None
    sort_by: str = "created_at"
    sort_order: str = "desc"
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
