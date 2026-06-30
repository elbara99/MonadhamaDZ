from __future__ import annotations

from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class HealthResponse(BaseModel):
    """Response payload for the /health endpoint."""

    status: str = Field("healthy", description="Service health status")
    version: str = Field("1.0.0", description="Application version")
    timestamp: datetime = Field(default_factory=lambda: datetime.now())


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str
    code: str = "OK"


class ErrorResponse(BaseModel):
    """Standard error response body."""

    detail: str
    code: str = "ERROR"
    path: str | None = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Wrapper for paginated list responses."""

    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
