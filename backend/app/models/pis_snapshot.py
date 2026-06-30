from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import DateTime, Float, Index, Integer, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PISSnapshot(Base):
    """Historical snapshot of a province's PIS at a point in time."""

    __tablename__ = "pis_snapshots"

    __table_args__ = (
        Index("ix_pis_snapshots_province_snapshot", "province_code", "snapshot_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    province_code: Mapped[str] = mapped_column(String(6), nullable=False, index=True)
    snapshot_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    composite_score: Mapped[float] = mapped_column(Float, nullable=False)
    dimension_scores: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    total_indicators: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    def __repr__(self) -> str:
        return f"<PISSnapshot {self.province_code} {self.snapshot_date.date()}={self.composite_score}>"
