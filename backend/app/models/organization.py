from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Organization(Base):
    """Government organization — ministry, department, institution, or municipality."""

    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code: Mapped[str] = mapped_column(String(20), nullable=False, unique=True, index=True)
    name_ar: Mapped[str] = mapped_column(String(200), nullable=False)
    name_fr: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    province_code: Mapped[str | None] = mapped_column(
        String(6), ForeignKey("provinces.code"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC), nullable=False)

    province: Mapped["Province"] = relationship(back_populates="organizations", lazy="selectin")
    projects: Mapped[list["Project"]] = relationship(back_populates="organization", lazy="selectin")
    reports: Mapped[list["Report"]] = relationship(back_populates="organization", lazy="selectin")
    documents: Mapped[list["Document"]] = relationship(back_populates="organization", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Organization {self.code} {self.name_fr}>"
