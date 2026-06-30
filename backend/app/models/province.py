from __future__ import annotations

from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Province(Base):
    """Algerian province (wilaya) reference data."""

    __tablename__ = "provinces"

    code: Mapped[str] = mapped_column(String(6), primary_key=True, comment="DZ-XX code")
    name_ar: Mapped[str] = mapped_column(String(100), nullable=False, comment="Arabic name")
    name_fr: Mapped[str] = mapped_column(String(100), nullable=False, comment="French name")
    population: Mapped[int] = mapped_column(Integer, nullable=False)
    area: Mapped[float] = mapped_column(Float, nullable=False, comment="Area in km²")
    region: Mapped[str] = mapped_column(String(50), nullable=False, comment="Geographic region")

    organizations: Mapped[list["Organization"]] = relationship(back_populates="province", lazy="selectin")
    projects: Mapped[list["Project"]] = relationship(back_populates="province", lazy="selectin")
    indicators: Mapped[list["Indicator"]] = relationship(back_populates="province", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Province {self.code} {self.name_fr}>"
