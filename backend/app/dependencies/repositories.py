from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.document_repository import DocumentRepository
from app.repositories.indicator_repository import IndicatorRepository
from app.repositories.organization_repository import OrganizationRepository
from app.repositories.pis_repository import (
    PISAlertRepository,
    PISConfigRepository,
    PISRecommendationRepository,
    PISScoreRepository,
    PISSnapshotRepository,
)
from app.repositories.project_repository import ProjectRepository
from app.repositories.province_repository import ProvinceRepository
from app.repositories.report_repository import ReportRepository


async def get_province_repository(session: AsyncSession = Depends(get_db)) -> ProvinceRepository:
    return ProvinceRepository(session)


async def get_organization_repository(session: AsyncSession = Depends(get_db)) -> OrganizationRepository:
    return OrganizationRepository(session)


async def get_project_repository(session: AsyncSession = Depends(get_db)) -> ProjectRepository:
    return ProjectRepository(session)


async def get_indicator_repository(session: AsyncSession = Depends(get_db)) -> IndicatorRepository:
    return IndicatorRepository(session)


async def get_report_repository(session: AsyncSession = Depends(get_db)) -> ReportRepository:
    return ReportRepository(session)


async def get_document_repository(session: AsyncSession = Depends(get_db)) -> DocumentRepository:
    return DocumentRepository(session)


# --- PIS repos ---

async def get_pis_config_repository(session: AsyncSession = Depends(get_db)) -> PISConfigRepository:
    return PISConfigRepository(session)


async def get_pis_score_repository(session: AsyncSession = Depends(get_db)) -> PISScoreRepository:
    return PISScoreRepository(session)


async def get_pis_snapshot_repository(session: AsyncSession = Depends(get_db)) -> PISSnapshotRepository:
    return PISSnapshotRepository(session)


async def get_pis_alert_repository(session: AsyncSession = Depends(get_db)) -> PISAlertRepository:
    return PISAlertRepository(session)


async def get_pis_recommendation_repository(session: AsyncSession = Depends(get_db)) -> PISRecommendationRepository:
    return PISRecommendationRepository(session)
