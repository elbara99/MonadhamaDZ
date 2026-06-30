from __future__ import annotations

import uuid
from datetime import UTC, date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Project(Base):
    """Development project tracked by the platform."""

    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    organization_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True, index=True
    )
    province_code: Mapped[str | None] = mapped_column(
        String(6), ForeignKey("provinces.code"), nullable=True, index=True
    )
    budget: Mapped[float | None] = mapped_column(Float, nullable=True, comment="Budget in DZD")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="planned", index=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False)

    organization: Mapped["Organization"] = relationship(back_populates="projects", lazy="selectin")
    province: Mapped["Province"] = relationship(back_populates="projects", lazy="selectin")
    documents: Mapped[list["Document"]] = relationship(back_populates="project", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Project {self.title} status={self.status}>"
