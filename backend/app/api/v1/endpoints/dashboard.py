from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.pis import (
    DashboardAlert,
    DashboardKPIs,
    DashboardMapProvince,
    DashboardRankingItem,
    DashboardSummary,
    DashboardTrend,
    ProvinceDetail,
)
from app.services.pis_analytics import AnalyticsService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _get_analytics(session: AsyncSession = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(session)


@router.get("/summary", response_model=DashboardSummary)
async def dashboard_summary(
    analytics: AnalyticsService = Depends(_get_analytics),
) -> DashboardSummary:
    return await analytics.get_summary()


@router.get("/kpis", response_model=DashboardKPIs)
async def dashboard_kpis(
    analytics: AnalyticsService = Depends(_get_analytics),
) -> DashboardKPIs:
    return await analytics.get_kpis()


@router.get("/map", response_model=list[DashboardMapProvince])
async def dashboard_map(
    analytics: AnalyticsService = Depends(_get_analytics),
) -> list[DashboardMapProvince]:
    return await analytics.get_map_data()


@router.get("/rankings", response_model=list[DashboardRankingItem])
async def dashboard_rankings(
    analytics: AnalyticsService = Depends(_get_analytics),
) -> list[DashboardRankingItem]:
    return await analytics.get_rankings()


@router.get("/alerts", response_model=list[DashboardAlert])
async def dashboard_alerts(
    limit: int = Query(20, ge=1, le=100),
    analytics: AnalyticsService = Depends(_get_analytics),
) -> list[DashboardAlert]:
    return await analytics.get_alerts(limit=limit)


@router.get("/trends", response_model=list[DashboardTrend])
async def dashboard_trends(
    analytics: AnalyticsService = Depends(_get_analytics),
) -> list[DashboardTrend]:
    return await analytics.get_trends()


@router.get("/provinces/{code}", response_model=ProvinceDetail)
async def dashboard_province_detail(
    code: str,
    analytics: AnalyticsService = Depends(_get_analytics),
) -> ProvinceDetail:
    try:
        return await analytics.get_province_detail(code)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
