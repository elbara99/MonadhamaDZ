from __future__ import annotations

import logging
import sys

from app.core.config import settings


def setup_logging() -> None:
    """Configure the root logger with structured formatting and console output."""
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(settings.LOG_LEVEL.upper())
    formatter = logging.Formatter(settings.LOG_FORMAT)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(settings.LOG_LEVEL.upper())
    # Remove default handlers to avoid duplicate output
    for h in root_logger.handlers[:]:
        root_logger.removeHandler(h)
    root_logger.addHandler(handler)

    # Quiet noisy third-party loggers in production
    if not settings.DEBUG:
        for name in ("uvicorn.access", "sqlalchemy.engine", "httpx"):
            logging.getLogger(name).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Return a child logger for the given module name."""
    return logging.getLogger(name)
