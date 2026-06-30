from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PISRecommendation(Base):
    """Rule-based recommendation for province improvement."""

    __tablename__ = "pis_recommendations"

    __table_args__ = (
        Index("ix_pis_recs_province_priority", "province_code", "priority"),
        Index("ix_pis_recs_implemented", "implemented"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    province_code: Mapped[str] = mapped_column(String(6), nullable=False, index=True)
    dimension: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=0, comment="Higher = more urgent")
    implemented: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    implemented_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<PISRecommendation {self.province_code} {self.dimension}>"
