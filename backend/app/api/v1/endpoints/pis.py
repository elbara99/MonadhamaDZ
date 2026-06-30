from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_permission
from app.dependencies.repositories import (
    get_pis_alert_repository,
    get_pis_config_repository,
    get_pis_recommendation_repository,
    get_pis_score_repository,
)
from app.repositories.pis_repository import (
    PISAlertRepository,
    PISConfigRepository,
    PISRecommendationRepository,
    PISScoreRepository,
)
from app.schemas.common import MessageResponse
from app.schemas.pis import (
    PISAlertCreate,
    PISAlertRead,
    PISConfigCreate,
    PISConfigRead,
    PISConfigUpdate,
    PISRecommendationRead,
    PISScoreRead,
)
from app.services.pis_recommendations import RecommendationService
from app.services.pis_risks import RiskDetectionService
from app.services.pis_scoring import ScoringEngine
from app.utils.enums import Permission

router = APIRouter(
    prefix="/pis",
    tags=["PIS"],
)


def _get_scoring(session: AsyncSession = Depends(get_db)) -> ScoringEngine:
    return ScoringEngine(session)


def _get_risks(session: AsyncSession = Depends(get_db)) -> RiskDetectionService:
    return RiskDetectionService(session)


def _get_recs(session: AsyncSession = Depends(get_db)) -> RecommendationService:
    return RecommendationService(session)


# --- Config / Weights ---

@router.get("/config", response_model=list[PISConfigRead])
async def list_config(
    repo: PISConfigRepository = Depends(get_pis_config_repository),
) -> list[PISConfigRead]:
    configs = await repo.list_all_ordered()
    return [PISConfigRead.model_validate(c) for c in configs]


@router.post("/config", response_model=PISConfigRead, status_code=status.HTTP_201_CREATED)
async def create_config(
    body: PISConfigCreate,
    _: None = Depends(require_permission(Permission.CONFIG_UPDATE)),
    repo: PISConfigRepository = Depends(get_pis_config_repository),
) -> PISConfigRead:
    existing = await repo.get_by_dimension(body.dimension)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Dimension '{body.dimension}' already exists")
    instance = await repo.create(**body.model_dump())
    return PISConfigRead.model_validate(instance)


@router.patch("/config/{dimension}", response_model=PISConfigRead)
async def update_config(
    dimension: str,
    body: PISConfigUpdate,
    _: None = Depends(require_permission(Permission.CONFIG_UPDATE)),
    repo: PISConfigRepository = Depends(get_pis_config_repository),
) -> PISConfigRead:
    existing = await repo.get_by_dimension(dimension)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Dimension '{dimension}' not found")
    update_data = body.model_dump(exclude_unset=True, exclude_none=True)
    if not update_data:
        return PISConfigRead.model_validate(existing)
    updated = await repo.update(existing.id, **update_data)
    return PISConfigRead.model_validate(updated)


# --- Scoring ---

@router.post("/compute/{province_code}", response_model=PISScoreRead)
async def compute_province_score(
    province_code: str,
    year: int | None = None,
    quarter: int = 1,
    engine: ScoringEngine = Depends(_get_scoring),
) -> PISScoreRead:
    score = await engine.compute(province_code.upper(), year, quarter)
    return PISScoreRead.model_validate(score)


@router.post("/compute", response_model=list[PISScoreRead])
async def compute_all_scores(
    engine: ScoringEngine = Depends(_get_scoring),
) -> list[PISScoreRead]:
    scores = await engine.compute_all()
    return [PISScoreRead.model_validate(s) for s in scores]


@router.get("/scores", response_model=list[PISScoreRead])
async def list_scores(
    repo: PISScoreRepository = Depends(get_pis_score_repository),
) -> list[PISScoreRead]:
    scores = await repo.get_all_ordered_by_score()
    return [PISScoreRead.model_validate(s) for s in scores]


# --- Snapshots ---

@router.post("/snapshot", response_model=MessageResponse)
async def take_snapshot(
    engine: ScoringEngine = Depends(_get_scoring),
) -> MessageResponse:
    await engine.snapshot_all()
    return MessageResponse(message="Snapshots created", code="OK")


# --- Risk Detection ---

@router.post("/risks/scan", response_model=list[PISAlertRead])
async def scan_risks(
    risks: RiskDetectionService = Depends(_get_risks),
) -> list[PISAlertRead]:
    alerts = await risks.scan_all()
    return [PISAlertRead.model_validate(a) for a in alerts]


@router.get("/alerts", response_model=list[PISAlertRead])
async def list_alerts(
    province_code: str | None = None,
    repo: PISAlertRepository = Depends(get_pis_alert_repository),
) -> list[PISAlertRead]:
    alerts = await repo.list_active(province_code=province_code)
    return [PISAlertRead.model_validate(a) for a in alerts]


@router.post("/alerts", response_model=PISAlertRead, status_code=status.HTTP_201_CREATED)
async def create_alert(
    body: PISAlertCreate,
    repo: PISAlertRepository = Depends(get_pis_alert_repository),
) -> PISAlertRead:
    instance = await repo.create(**body.model_dump())
    return PISAlertRead.model_validate(instance)


@router.patch("/alerts/{alert_id}/resolve", response_model=PISAlertRead)
async def resolve_alert(
    alert_id: str,
    repo: PISAlertRepository = Depends(get_pis_alert_repository),
) -> PISAlertRead:
    from uuid import UUID
    pk = UUID(alert_id)
    alert = await repo.get(pk)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    updated = await repo.update(pk, resolved=True)
    return PISAlertRead.model_validate(updated)


# --- Recommendations ---

@router.post("/recommendations/generate", response_model=list[PISRecommendationRead])
async def generate_recommendations(
    recs: RecommendationService = Depends(_get_recs),
) -> list[PISRecommendationRead]:
    generated = await recs.generate_all()
    return [PISRecommendationRead.model_validate(r) for r in generated]


@router.get("/recommendations", response_model=list[PISRecommendationRead])
async def list_recommendations(
    province_code: str | None = None,
    repo: PISRecommendationRepository = Depends(get_pis_recommendation_repository),
) -> list[PISRecommendationRead]:
    if province_code:
        recs = await repo.list_by_province(province_code)
    else:
        recs = await repo.list_pending()
    return [PISRecommendationRead.model_validate(r) for r in recs]
