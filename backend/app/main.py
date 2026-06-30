from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.exceptions import AppException, global_exception_handler, unhandled_exception_handler
from app.middleware.logging_middleware import RequestLoggingMiddleware


def create_app() -> FastAPI:
    """Build and return the configured FastAPI application instance."""
    setup_logging()

    app = FastAPI(
        title=settings.APP_NAME,
        description=settings.APP_DESCRIPTION,
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # --- Exception handlers ---
    app.add_exception_handler(AppException, global_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)

    # --- Middleware (order matters: outermost first) ---
    # CORS must be outermost to respond to preflight before other middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=settings.CORS_ALLOW_METHODS,
        allow_headers=settings.CORS_ALLOW_HEADERS,
    )
    app.add_middleware(RequestLoggingMiddleware)  # type: ignore[arg-type]

    # --- Routers ---
    app.include_router(v1_router)

    return app


app = create_app()
