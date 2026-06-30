from __future__ import annotations

from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger("exceptions")


class AppException(Exception):
    """Base application exception that maps to a structured HTTP error response."""

    def __init__(self, detail: str | None = None) -> None:
        self.detail = detail or self.detail
        super().__init__(self.detail)

    status_code: int = 500
    detail: str = "Internal server error"
    code: str = "INTERNAL_ERROR"


class NotFoundException(AppException):
    status_code = 404
    code = "NOT_FOUND"
    detail: str = "Resource not found"


class ConflictException(AppException):
    status_code = 409
    code = "CONFLICT"
    detail: str = "Resource already exists"


class UnprocessableException(AppException):
    status_code = 422
    code = "UNPROCESSABLE"
    detail: str = "Unprocessable entity"


async def global_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Global handler for all AppException subclasses."""
    logger.warning(
        "App exception: %s — %s — path=%s",
        exc.code,
        exc.detail,
        request.url.path,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "code": exc.code,
            "path": str(request.url.path),
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Fallback handler for unhandled exceptions (500)."""
    logger.exception("Unhandled exception at %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred",
            "code": "INTERNAL_ERROR",
            "path": str(request.url.path),
        },
    )
