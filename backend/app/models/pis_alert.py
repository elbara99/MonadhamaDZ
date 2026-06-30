from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PISAlert(Base):
    """Automatically generated risk alert for a province."""

    __tablename__ = "pis_alerts"

    __table_args__ = (
        Index("ix_pis_alerts_province_resolved", "province_code", "resolved"),
        Index("ix_pis_alerts_resolved_type", "resolved", "alert_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    province_code: Mapped[str] = mapped_column(String(6), nullable=False, index=True)
    alert_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True,
        comment="missing_indicators / low_performance / budget_anomaly / project_delay / kpi_regression"
    )
    severity: Mapped[str] = mapped_column(
        String(20), nullable=False, default="info",
        comment="critical / warning / info"
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<PISAlert {self.alert_type} {self.severity} {self.province_code}>"
