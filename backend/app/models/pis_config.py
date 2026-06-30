from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PISConfig(Base):
    """Configurable dimension weight for PIS composite score calculation."""

    __tablename__ = "pis_config"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dimension: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True, comment="Dimension key (health, education, economy, etc.)")
    weight: Mapped[float] = mapped_column(Float, nullable=False, comment="Weight as decimal 0.0–1.0")
    label_en: Mapped[str] = mapped_column(String(100), nullable=False)
    label_fr: Mapped[str] = mapped_column(String(100), nullable=False)
    label_ar: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False)

    def __repr__(self) -> str:
        return f"<PISConfig {self.dimension}={self.weight}>"
