from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# --- PISConfig ---

class PISConfigCreate(BaseModel):
    dimension: str = Field(..., min_length=1, max_length=50)
    weight: float = Field(..., ge=0.0, le=1.0)
    label_en: str = Field(..., min_length=1, max_length=100)
    label_fr: str = Field(..., min_length=1, max_length=100)
    label_ar: str = Field(..., min_length=1, max_length=100)


class PISConfigUpdate(BaseModel):
    weight: float | None = Field(None, ge=0.0, le=1.0)
    label_en: str | None = None
    label_fr: str | None = None
    label_ar: str | None = None


class PISConfigRead(BaseModel):
    id: uuid.UUID
    dimension: str
    weight: float
    label_en: str
    label_fr: str
    label_ar: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# --- PISScore ---

class PISScoreRead(BaseModel):
    id: uuid.UUID
    province_code: str
    year: int
    quarter: int
    composite_score: float
    dimension_scores: dict[str, Any]
    category: str
    calculated_at: datetime
    model_config = {"from_attributes": True}


# --- PISSnapshot ---

class PISSnapshotCreate(BaseModel):
    province_code: str
    composite_score: float
    dimension_scores: dict[str, Any]
    category: str
    total_indicators: int = 0


class PISSnapshotRead(BaseModel):
    id: uuid.UUID
    province_code: str
    snapshot_date: datetime
    composite_score: float
    dimension_scores: dict[str, Any]
    category: str
    total_indicators: int
    created_at: datetime
    model_config = {"from_attributes": True}


# --- PISAlert ---

class PISAlertCreate(BaseModel):
    province_code: str
    alert_type: str
    severity: str = "info"
    title: str
    description: str


class PISAlertRead(BaseModel):
    id: uuid.UUID
    province_code: str
    alert_type: str
    severity: str
    title: str
    description: str
    resolved: bool
    created_at: datetime
    resolved_at: datetime | None
    model_config = {"from_attributes": True}


# --- PISRecommendation ---

class PISRecommendationRead(BaseModel):
    id: uuid.UUID
    province_code: str
    dimension: str
    title: str
    description: str
    priority: int
    implemented: bool
    created_at: datetime
    implemented_at: datetime | None
    model_config = {"from_attributes": True}


# --- Dashboard ---

class DashboardKPIs(BaseModel):
    total_provinces: int
    total_population: int
    avg_composite_score: float
    provinces_scored: int
    active_alerts: int
    pending_recommendations: int
    total_projects: int
    indicators_tracked: int


class DashboardMapProvince(BaseModel):
    code: str
    name_fr: str
    name_ar: str
    composite_score: float | None
    category: str | None
    latitude: float | None
    longitude: float | None


class DashboardRankingItem(BaseModel):
    rank: int
    code: str
    name_fr: str
    name_ar: str
    composite_score: float
    category: str
    population: int
    top_dimension: str | None
    bottom_dimension: str | None


class DashboardAlert(BaseModel):
    id: uuid.UUID
    province_code: str
    province_name: str
    alert_type: str
    severity: str
    title: str
    description: str
    created_at: datetime


class DashboardTrend(BaseModel):
    period: str
    avg_composite_score: float
    provinces_tracked: int


class DashboardSummary(BaseModel):
    kpis: DashboardKPIs
    rankings: list[DashboardRankingItem]
    alerts: list[DashboardAlert]
    trends: list[DashboardTrend]


# --- Province Detail ---

class DimensionScore(BaseModel):
    dimension: str
    label_en: str
    label_fr: str
    label_ar: str
    score: float
    weight: float


class ProvinceDetail(BaseModel):
    code: str
    name_fr: str
    name_ar: str
    population: int
    area: float
    region: str
    composite_score: float | None
    category: str | None
    dimension_scores: list[DimensionScore] = []
    strengths: list[str] = []
    weaknesses: list[str] = []
    rank: int | None
    total_provinces: int
    projects_count: int
    organizations_count: int
    indicators_count: int
    alerts: list[PISAlertRead] = []
    recommendations: list[PISRecommendationRead] = []
