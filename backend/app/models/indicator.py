from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Indicator(Base):
    """KPI or statistical indicator for a province and year."""

    __tablename__ = "indicators"

    __table_args__ = (
        Index("ix_indicators_province_dimension", "province_code", "dimension"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    target: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    province_code: Mapped[str] = mapped_column(
        String(6), ForeignKey("provinces.code"), nullable=False, index=True
    )
    dimension: Mapped[str | None] = mapped_column(
        String(50), nullable=True, index=True,
        comment="PIS dimension: health, education, economy, employment, investment, infrastructure, security, environment, transportation, water, agriculture, tourism"
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False)

    province: Mapped["Province"] = relationship(back_populates="indicators", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Indicator {self.name} {self.province_code} {self.year}>"
