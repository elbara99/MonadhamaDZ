from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.indicator import Indicator
from app.models.pis_alert import PISAlert
from app.models.pis_score import PISScore
from app.models.project import Project
from app.models.province import Province
from app.repositories.pis_repository import PISAlertRepository, PISScoreRepository


class RiskDetectionService:
    """Detects risks and generates automatic PIS alerts."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def scan_all(self) -> list[PISAlert]:
        """Run all risk scans and return newly created alerts."""
        generated: list[PISAlert] = []
        generated.extend(await self._scan_missing_indicators())
        generated.extend(await self._scan_low_performance())
        generated.extend(await self._scan_budget_anomalies())
        generated.extend(await self._scan_project_delays())
        generated.extend(await self._scan_kpi_regression())
        return generated

    async def _scan_missing_indicators(self) -> list[PISAlert]:
        repo = PISAlertRepository(self._session)
        alerts: list[PISAlert] = []
        result = await self._session.execute(
            select(Province.code, func.count(Indicator.id))
            .outerjoin(Indicator, (Province.code == Indicator.province_code) & Indicator.dimension.isnot(None))
            .group_by(Province.code)
        )
        rows = result.all()
        codes_with_data = {row[0] for row in rows if row[1] > 0}
        all_codes = {row[0] for row in rows}
        missing_codes = sorted(all_codes - codes_with_data)
        existing_alerts = await repo.list_active()
        existing_missing = {
            a.province_code
            for a in existing_alerts
            if a.alert_type == "missing_indicators"
        }
        for code in missing_codes:
            if code in existing_missing:
                continue
            alert = await repo.create(
                province_code=code,
                alert_type="missing_indicators",
                severity="warning",
                title=f"No PIS indicators for province {code}",
                description=f"Province {code} has no indicators assigned to PIS dimensions. Add indicators with a dimension to enable scoring.",
            )
            alerts.append(alert)
        return alerts

    async def _scan_low_performance(self) -> list[PISAlert]:
        repo = PISAlertRepository(self._session)
        alerts: list[PISAlert] = []
        scores = await PISScoreRepository(self._session).get_all_ordered_by_score()
        for score in scores:
            if score.composite_score >= 40:
                continue
            existing = await repo.list_active(province_code=score.province_code)
            if any(a.alert_type == "low_performance" for a in existing):
                continue
            alert = await repo.create(
                province_code=score.province_code,
                alert_type="low_performance",
                severity="critical",
                title=f"Critical performance: {score.province_code} scores {score.composite_score}",
                description=f"Province {score.province_code} has a composite score of {score.composite_score} ({score.category}). Immediate intervention required.",
            )
            alerts.append(alert)
        return alerts

    async def _scan_budget_anomalies(self) -> list[PISAlert]:
        repo = PISAlertRepository(self._session)
        alerts: list[PISAlert] = []
        result = await self._session.execute(
            select(Project).where(
                Project.budget.isnot(None),
                Project.status == "in_progress",
            )
        )
        projects = result.scalars().all()
        existing_alerts = await repo.list_active()
        existing_budget = {
            (a.province_code, a.alert_type)
            for a in existing_alerts
            if a.alert_type == "budget_anomaly"
        }
        for project in projects:
            if not project.end_date:
                continue
            days_remaining = (project.end_date - datetime.now(UTC).date()).days
            if 0 <= days_remaining <= 30:
                pcode = project.province_code or "UNKNOWN"
                if (pcode, "budget_anomaly") in existing_budget:
                    continue
                alert = await repo.create(
                    province_code=pcode,
                    alert_type="budget_anomaly",
                    severity="warning",
                    title=f"Budget tracking: {project.title} nearing deadline",
                    description=f"Project '{project.title}' has {days_remaining} days remaining with budget {project.budget:,.0f} DZD. Review spending before deadline.",
                )
                alerts.append(alert)
        return alerts

    async def _scan_project_delays(self) -> list[PISAlert]:
        repo = PISAlertRepository(self._session)
        alerts: list[PISAlert] = []
        today = datetime.now(UTC).date()
        result = await self._session.execute(
            select(Project).where(
                Project.end_date.isnot(None),
                Project.end_date < today,
                Project.status == "in_progress",
            )
        )
        projects = result.scalars().all()
        existing_alerts = await repo.list_active()
        existing_delay = {
            (a.province_code, "project_delay")
            for a in existing_alerts
            if a.alert_type == "project_delay"
        }
        for project in projects:
            pcode = project.province_code or "UNKNOWN"
            if (pcode, "project_delay") in existing_delay:
                continue
            days_over = (today - project.end_date).days
            alert = await repo.create(
                province_code=pcode,
                alert_type="project_delay",
                severity="critical" if days_over > 90 else "warning",
                title=f"Project overdue: {project.title}",
                description=f"Project '{project.title}' is {days_over} days past its deadline of {project.end_date}.",
            )
            alerts.append(alert)
        return alerts

    async def _scan_kpi_regression(self) -> list[PISAlert]:
        repo = PISAlertRepository(self._session)
        alerts: list[PISAlert] = []
        scores_result = await self._session.execute(
            select(PISScore).order_by(PISScore.province_code, PISScore.year.desc(), PISScore.quarter.desc())
        )
        all_scores = scores_result.scalars().all()

        province_scores: dict[str, list[PISScore]] = {}
        for s in all_scores:
            province_scores.setdefault(s.province_code, []).append(s)

        existing_alerts = await repo.list_active()
        existing_regression = {
            a.province_code
            for a in existing_alerts
            if a.alert_type == "kpi_regression"
        }
        for code, recent in province_scores.items():
            if len(recent) < 2:
                continue
            current = recent[0]
            previous = recent[1]
            if current.composite_score >= previous.composite_score:
                continue
            drop = previous.composite_score - current.composite_score
            if drop < 5:
                continue
            if code in existing_regression:
                continue
            alert = await repo.create(
                province_code=code,
                alert_type="kpi_regression",
                severity="warning",
                title=f"KPI regression in {code}: score dropped by {drop:.1f}",
                description=f"Province {code} composite score dropped from {previous.composite_score} to {current.composite_score} ({drop:.1f} point decline). Investigate contributing factors.",
            )
            alerts.append(alert)
        return alerts
