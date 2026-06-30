from __future__ import annotations

from fastapi import APIRouter

from app.core.config import settings
from app.schemas.common import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return the current service health status and application version."""
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
    )
