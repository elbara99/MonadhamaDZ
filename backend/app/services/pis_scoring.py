from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.indicator import Indicator
from app.models.pis_config import PISConfig
from app.models.pis_score import PISScore
from app.models.pis_snapshot import PISSnapshot
from app.repositories.pis_repository import (
    PISAlertRepository,
    PISConfigRepository,
    PISRecommendationRepository,
    PISScoreRepository,
    PISSnapshotRepository,
)


CATEGORY_THRESHOLDS = [
    ("Excellent", 90),
    ("Good", 75),
    ("Average", 60),
    ("Needs Improvement", 40),
    ("Critical", 0),
]


def classify_score(score: float) -> str:
    for label, threshold in CATEGORY_THRESHOLDS:
        if score >= threshold:
            return label
    return "Critical"


class ScoringEngine:
    """Computes PIS composite scores from raw indicators and configurable weights."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def compute(
        self,
        province_code: str,
        year: int | None = None,
        quarter: int = 1,
    ) -> PISScore:
        weights = await self._load_weights()
        dim_scores = await self._compute_dimension_scores(province_code, year)
        composite = self._compute_composite(dim_scores, weights)
        category = classify_score(composite)
        target_year = year or datetime.now(UTC).year
        rep = PISScoreRepository(self._session)
        existing = await self._session.scalar(
            select(PISScore).where(
                PISScore.province_code == province_code,
                PISScore.year == target_year,
                PISScore.quarter == quarter,
            )
        )
        if existing:
            score = await rep.update(
                existing.id,
                composite_score=round(composite, 2),
                dimension_scores=dim_scores,
                category=category,
            )
        else:
            score = await rep.create(
                province_code=province_code,
                year=target_year,
                quarter=quarter,
                composite_score=round(composite, 2),
                dimension_scores=dim_scores,
                category=category,
            )
        return score

    async def compute_all(
        self,
        year: int | None = None,
        quarter: int = 1,
    ) -> list[PISScore]:
        stmt = select(Indicator).where(
            Indicator.dimension.isnot(None),
        )
        if year:
            stmt = stmt.where(Indicator.year == year)
        result = await self._session.execute(stmt)
        all_indicators = result.scalars().all()

        weights = await self._load_weights()
        provinces: dict[str, list[Indicator]] = {}
        for ind in all_indicators:
            provinces.setdefault(ind.province_code, []).append(ind)

        score_repo = PISScoreRepository(self._session)
        target_year = year or datetime.now(UTC).year
        scores = []
        for code, indicators in provinces.items():
            dim_scores = self._compute_dimension_scores_from_indicators(indicators)
            composite = self._compute_composite(dim_scores, weights)
            category = classify_score(composite)
            score = await score_repo.create(
                province_code=code,
                year=target_year,
                quarter=quarter,
                composite_score=round(composite, 2),
                dimension_scores=dim_scores,
                category=category,
            )
            scores.append(score)
        return scores

    async def snapshot_all(self) -> list[PISSnapshot]:
        stmt = select(
            PISScore.province_code,
            func.max(PISScore.year).label("max_year"),
            func.max(PISScore.quarter).label("max_quarter"),
        ).group_by(PISScore.province_code)
        result = await self._session.execute(stmt)
        rows = result.all()

        snap_repo = PISSnapshotRepository(self._session)
        score_repo = PISScoreRepository(self._session)
        snapshots = []
        for code, _, _ in rows:
            latest = await score_repo.get_latest(code)
            if not latest:
                continue
            total = await self._count_indicators(code)
            snapshot = await snap_repo.create(
                province_code=code,
                snapshot_date=datetime.now(UTC),
                composite_score=latest.composite_score,
                dimension_scores=latest.dimension_scores,
                category=latest.category,
                total_indicators=total,
            )
            snapshots.append(snapshot)
        return snapshots

    async def _load_weights(self) -> dict[str, float]:
        configs = await PISConfigRepository(self._session).list_all_ordered()
        if not configs:
            return {}
        total = sum(c.weight for c in configs)
        if total <= 0:
            return {c.dimension: 1.0 / len(configs) for c in configs}
        return {c.dimension: c.weight / total for c in configs}

    async def _compute_dimension_scores(
        self,
        province_code: str,
        year: int | None = None,
    ) -> dict[str, float]:
        stmt = select(Indicator).where(
            Indicator.province_code == province_code,
            Indicator.dimension.isnot(None),
        )
        if year:
            stmt = stmt.where(Indicator.year == year)
        stmt = stmt.order_by(Indicator.year.desc())
        result = await self._session.execute(stmt)
        indicators = result.scalars().all()
        return self._compute_dimension_scores_from_indicators(indicators)

    def _compute_dimension_scores_from_indicators(
        self,
        indicators: list[Indicator],
    ) -> dict[str, float]:
        dim_values: dict[str, list[float]] = {}
        for ind in indicators:
            dim = ind.dimension
            if not dim:
                continue
            normalized = self._normalize(ind)
            if dim not in dim_values:
                dim_values[dim] = []
            dim_values[dim].append(normalized)
        return {
            dim: round(sum(vals) / len(vals), 2)
            for dim, vals in dim_values.items()
        }

    def _normalize(self, indicator: Indicator) -> float:
        if indicator.target and indicator.target > 0:
            pct = (indicator.value / indicator.target) * 100
            return min(max(pct, 0), 100)
        return min(max(indicator.value, 0), 100)

    def _compute_composite(
        self,
        dim_scores: dict[str, float],
        weights: dict[str, float],
    ) -> float:
        if not dim_scores or not weights:
            return 0.0
        weighted_sum = 0.0
        total_weight = 0.0
        for dim, score in dim_scores.items():
            w = weights.get(dim, 0)
            weighted_sum += score * w
            total_weight += w
        if total_weight <= 0:
            return 0.0
        return weighted_sum / total_weight

    async def _count_indicators(self, province_code: str) -> int:
        result = await self._session.execute(
            select(func.count(Indicator.id)).where(
                Indicator.province_code == province_code,
                Indicator.dimension.isnot(None),
            )
        )
        return result.scalar() or 0
