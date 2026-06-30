from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import DateTime, Float, Integer, JSON, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PISScore(Base):
    """Calculated PIS composite score and dimension scores for a province-period."""

    __tablename__ = "pis_scores"

    __table_args__ = (
        UniqueConstraint("province_code", "year", "quarter", name="uq_pis_scores_province_year_quarter"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    province_code: Mapped[str] = mapped_column(String(6), nullable=False, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    quarter: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    composite_score: Mapped[float] = mapped_column(Float, nullable=False)
    dimension_scores: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, comment="Map of dimension→score")
    category: Mapped[str] = mapped_column(String(50), nullable=False, comment="Excellent/Good/Average/Needs Improvement/Critical")
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)

    def __repr__(self) -> str:
        return f"<PISScore {self.province_code} Q{self.quarter} {self.year}={self.composite_score}>"
