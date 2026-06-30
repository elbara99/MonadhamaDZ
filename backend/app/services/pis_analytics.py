from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.indicator import Indicator
from app.models.pis_alert import PISAlert
from app.models.pis_score import PISScore
from app.models.pis_snapshot import PISSnapshot
from app.models.province import Province
from app.repositories.pis_repository import (
    PISAlertRepository,
    PISScoreRepository,
    PISSnapshotRepository,
)
from app.schemas.pis import (
    DashboardAlert,
    DashboardKPIs,
    DashboardMapProvince,
    DashboardRankingItem,
    DashboardSummary,
    DashboardTrend,
    DimensionScore,
    PISAlertRead,
    PISRecommendationRead,
    ProvinceDetail,
)


class AnalyticsService:
    """Provides analytics, rankings, trends, and aggregated dashboard data."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_kpis(self) -> DashboardKPIs:
        prov_count = await self._session.scalar(select(func.count(Province.code)))
        pop_sum = await self._session.scalar(select(func.coalesce(func.sum(Province.population), 0)))
        scores = await self._session.execute(
            select(PISScore.composite_score).order_by(PISScore.year.desc(), PISScore.quarter.desc())
        )
        all_scores = scores.scalars().all()
        distinct_provinces_scored = len(set(
            row[0] for row in (await self._session.execute(
                select(PISScore.province_code).distinct()
            )).all()
        ))
        avg_score = round(sum(all_scores) / len(all_scores), 2) if all_scores else 0.0
        active_alerts_count = await self._session.scalar(
            select(func.count(PISAlert.id)).where(PISAlert.resolved == False)
        ) or 0
        from app.models.pis_recommendation import PISRecommendation
        pending_recs = await self._session.scalar(
            select(func.count(PISRecommendation.id)).where(PISRecommendation.implemented == False)
        ) or 0
        from app.models.project import Project
        total_projects = await self._session.scalar(select(func.count(Project.id))) or 0
        total_indicators = await self._session.scalar(
            select(func.count(Indicator.id))  # noqa
        ) or 0
        return DashboardKPIs(
            total_provinces=prov_count or 0,
            total_population=pop_sum or 0,
            avg_composite_score=avg_score,
            provinces_scored=distinct_provinces_scored,
            active_alerts=active_alerts_count,
            pending_recommendations=pending_recs,
            total_projects=total_projects,
            indicators_tracked=total_indicators,
        )

    async def get_map_data(self) -> list[DashboardMapProvince]:
        result = await self._session.execute(select(Province).order_by(Province.code))
        provinces = result.scalars().all()
        latest_scores = await PISScoreRepository(self._session).get_latest_per_province()
        score_map = {s.province_code: s for s in latest_scores}
        items = []
        for p in provinces:
            latest = score_map.get(p.code)
            items.append(DashboardMapProvince(
                code=p.code,
                name_fr=p.name_fr,
                name_ar=p.name_ar,
                composite_score=latest.composite_score if latest else None,
                category=latest.category if latest else None,
                latitude=None,
                longitude=None,
            ))
        return items

    async def get_rankings(self) -> list[DashboardRankingItem]:
        scores = await PISScoreRepository(self._session).get_latest_per_province()
        scored = {s.province_code: s for s in scores}
        prov_result = await self._session.execute(select(Province))
        provinces = {p.code: p for p in prov_result.scalars().all()}
        ranked = sorted(
            [(code, s) for code, s in scored.items() if code in provinces],
            key=lambda x: x[1].composite_score, reverse=True,
        )
        items = []
        for i, (code, score) in enumerate(ranked, 1):
            p = provinces[code]
            dims = list(score.dimension_scores.items())
            top = max(dims, key=lambda x: x[1])[0] if dims else None
            bottom = min(dims, key=lambda x: x[1])[0] if dims else None
            items.append(DashboardRankingItem(
                rank=i,
                code=code,
                name_fr=p.name_fr,
                name_ar=p.name_ar,
                composite_score=score.composite_score,
                category=score.category,
                population=p.population,
                top_dimension=top,
                bottom_dimension=bottom,
            ))
        return items

    async def get_alerts(self, limit: int = 20) -> list[DashboardAlert]:
        alerts = await PISAlertRepository(self._session).list_active()
        prov_result = await self._session.execute(select(Province))
        provinces = {p.code: p for p in prov_result.scalars().all()}
        items = []
        for a in alerts[:limit]:
            p = provinces.get(a.province_code)
            items.append(DashboardAlert(
                id=a.id,
                province_code=a.province_code,
                province_name=p.name_fr if p else a.province_code,
                alert_type=a.alert_type,
                severity=a.severity,
                title=a.title,
                description=a.description,
                created_at=a.created_at,
            ))
        return items

    async def get_trends(self, limit: int = 12) -> list[DashboardTrend]:
        snapshots = await PISSnapshotRepository(self._session).get_trend_data()
        period_map: dict[str, list[float]] = {}
        for s in snapshots:
            key = s.snapshot_date.strftime("%Y-%m")
            if key not in period_map:
                period_map[key] = []
            period_map[key].append(s.composite_score)
        all_periods = sorted(period_map.items(), key=lambda x: x[0], reverse=True)[:limit]
        return [
            DashboardTrend(
                period=period,
                avg_composite_score=round(sum(scores) / len(scores), 2),
                provinces_tracked=len(scores),
            )
            for period, scores in all_periods
        ]

    async def get_summary(self) -> DashboardSummary:
        kpis = await self.get_kpis()
        rankings = await self.get_rankings()
        alerts = await self.get_alerts(limit=10)
        trends = await self.get_trends()
        return DashboardSummary(kpis=kpis, rankings=rankings, alerts=alerts, trends=trends)

    async def get_province_detail(self, code: str) -> ProvinceDetail:
        from app.models.pis_config import PISConfig
        from app.repositories.pis_repository import PISRecommendationRepository

        prov = await self._session.get(Province, code)
        if not prov:
            raise ValueError(f"Province {code} not found")

        latest = await PISScoreRepository(self._session).get_latest(code)
        configs = await self._session.execute(
            select(PISConfig).order_by(PISConfig.dimension)
        )
        config_list = configs.scalars().all()
        config_map = {c.dimension: c for c in config_list}

        dimension_scores = []
        strengths = []
        weaknesses = []
        if latest:
            for dim, score in latest.dimension_scores.items():
                cfg = config_map.get(dim)
                dimension_scores.append(DimensionScore(
                    dimension=dim,
                    label_en=cfg.label_en if cfg else dim,
                    label_fr=cfg.label_fr if cfg else dim,
                    label_ar=cfg.label_ar if cfg else dim,
                    score=score,
                    weight=cfg.weight if cfg else 0.0,
                ))
                if score >= 75:
                    strengths.append(dim)
                elif score < 50:
                    weaknesses.append(dim)

        rankings = await self.get_rankings()
        rank = None
        for r in rankings:
            if r.code == code:
                rank = r.rank
                break

        from app.models.project import Project
        from app.models.organization import Organization
        projects_count = await self._session.scalar(
            select(func.count(Project.id)).where(Project.province_code == code)
        ) or 0
        orgs_count = await self._session.scalar(
            select(func.count(Organization.id)).where(Organization.province_code == code)
        ) or 0
        indicators_count = await self._session.scalar(
            select(func.count(Indicator.id)).where(Indicator.province_code == code)
        ) or 0

        alert_repo = PISAlertRepository(self._session)
        alerts = await alert_repo.list_active(province_code=code)

        rec_repo = PISRecommendationRepository(self._session)
        recs = await rec_repo.list_by_province(code)

        return ProvinceDetail(
            code=prov.code,
            name_fr=prov.name_fr,
            name_ar=prov.name_ar,
            population=prov.population,
            area=prov.area,
            region=prov.region,
            composite_score=latest.composite_score if latest else None,
            category=latest.category if latest else None,
            dimension_scores=dimension_scores,
            strengths=strengths,
            weaknesses=weaknesses,
            rank=rank,
            total_provinces=len(rankings) if rankings else 0,
            projects_count=projects_count,
            organizations_count=orgs_count,
            indicators_count=indicators_count,
            alerts=[PISAlertRead.model_validate(a) for a in alerts],
            recommendations=[PISRecommendationRead.model_validate(r) for r in recs],
        )
