"""Integration tests for the Province Intelligence Engine (PIS)."""
from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.fixture(autouse=True)
def _use_setup_database(setup_database):
    pass


@pytest.fixture
async def admin_token(client: AsyncClient) -> str:
    from app.core.security import hash_password
    from app.repositories.user_repository import UserRepository
    from app.models.user import User
    from app.utils.enums import UserRole
    from app.tests.conftest import test_session_factory

    async with test_session_factory() as session:
        repo = UserRepository(session)
        existing = await repo.find_one(email="admin@test.com")
        if not existing:
            await repo.create(
                email="admin@test.com",
                hashed_password=hash_password("admin123"),
                full_name="Admin",
                role=UserRole.SUPER_ADMIN,
            )
            await session.commit()
    resp = await client.post("/api/v1/auth/login", json={"email": "admin@test.com", "password": "admin123"})
    data = resp.json()
    return data["access_token"]


@pytest.fixture
async def auth_headers(admin_token: str) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
async def seeded_provinces(client: AsyncClient, auth_headers: dict) -> list[dict]:
    provs = [
        {"code": "DZ-01", "name_ar": "أدرار", "name_fr": "Adrar", "population": 400_000, "area": 427_968, "region": "Sud"},
        {"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 3_000_000, "area": 1_190, "region": "Centre"},
    ]
    created = []
    for p in provs:
        resp = await client.post("/api/v1/provinces", json=p, headers=auth_headers)
        created.append(resp.json())
    return created


@pytest.fixture
async def seeded_indicators(client: AsyncClient, auth_headers: dict) -> list[dict]:
    inds = [
        {"name": "Life Expectancy", "value": 78.5, "target": 80.0, "unit": "years", "year": 2026, "province_code": "DZ-01", "dimension": "health"},
        {"name": "Hospital Beds/1000", "value": 2.5, "target": 3.0, "unit": "beds", "year": 2026, "province_code": "DZ-01", "dimension": "health"},
        {"name": "Literacy Rate", "value": 85.0, "target": 90.0, "unit": "%", "year": 2026, "province_code": "DZ-01", "dimension": "education"},
        {"name": "GDP per capita", "value": 4500, "target": 5000, "unit": "USD", "year": 2026, "province_code": "DZ-01", "dimension": "economy"},
        {"name": "Road Quality", "value": 60.0, "target": 80.0, "unit": "%", "year": 2026, "province_code": "DZ-01", "dimension": "infrastructure"},
        {"name": "Air Quality Index", "value": 70.0, "target": 75.0, "unit": "index", "year": 2026, "province_code": "DZ-01", "dimension": "environment"},
        {"name": "Unemployment Rate", "value": 8.0, "target": 10.0, "unit": "%", "year": 2026, "province_code": "DZ-16", "dimension": "employment"},
        {"name": "GDP per capita", "value": 8000, "target": 10000, "unit": "USD", "year": 2026, "province_code": "DZ-16", "dimension": "economy"},
    ]
    created = []
    for ind in inds:
        resp = await client.post("/api/v1/indicators", json=ind, headers=auth_headers)
        created.append(resp.json())
    return created


@pytest.fixture
async def seeded_config(client: AsyncClient, auth_headers: dict) -> list[dict]:
    configs = [
        {"dimension": "health", "weight": 0.20, "label_en": "Healthcare", "label_fr": "Santé", "label_ar": "الصحة"},
        {"dimension": "education", "weight": 0.15, "label_en": "Education", "label_fr": "Éducation", "label_ar": "التعليم"},
        {"dimension": "economy", "weight": 0.25, "label_en": "Economy", "label_fr": "Économie", "label_ar": "الاقتصاد"},
        {"dimension": "infrastructure", "weight": 0.15, "label_en": "Infrastructure", "label_fr": "Infrastructure", "label_ar": "البنية التحتية"},
        {"dimension": "environment", "weight": 0.10, "label_en": "Environment", "label_fr": "Environnement", "label_ar": "البيئة"},
        {"dimension": "employment", "weight": 0.05, "label_en": "Employment", "label_fr": "Emploi", "label_ar": "التوظيف"},
        {"dimension": "security", "weight": 0.03, "label_en": "Security", "label_fr": "Sécurité", "label_ar": "الأمن"},
        {"dimension": "investment", "weight": 0.03, "label_en": "Investment", "label_fr": "Investissement", "label_ar": "الاستثمار"},
        {"dimension": "transportation", "weight": 0.02, "label_en": "Transportation", "label_fr": "Transport", "label_ar": "النقل"},
        {"dimension": "water", "weight": 0.01, "label_en": "Water", "label_fr": "Eau", "label_ar": "المياه"},
        {"dimension": "agriculture", "weight": 0.01, "label_en": "Agriculture", "label_fr": "Agriculture", "label_ar": "الزراعة"},
        {"dimension": "tourism", "weight": 0.00, "label_en": "Tourism", "label_fr": "Tourisme", "label_ar": "السياحة"},
    ]
    created = []
    for cfg in configs:
        resp = await client.post("/api/v1/pis/config", json=cfg, headers=auth_headers)
        created.append(resp.json())
    return created


class TestPISConfig:
    async def test_list_config(self, client: AsyncClient, seeded_config):
        resp = await client.get("/api/v1/pis/config")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 12
        assert data[0]["dimension"] == "agriculture"  # ordered by dimension

    async def test_create_duplicate_config(self, client: AsyncClient, auth_headers: dict, seeded_config):
        resp = await client.post("/api/v1/pis/config", json={
            "dimension": "health", "weight": 0.5, "label_en": "X", "label_fr": "X", "label_ar": "X",
        }, headers=auth_headers)
        assert resp.status_code == 409

    async def test_update_config(self, client: AsyncClient, auth_headers: dict, seeded_config):
        resp = await client.patch("/api/v1/pis/config/health", json={"weight": 0.30}, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["weight"] == 0.30


class TestScoringEngine:
    async def test_compute_score(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        resp = await client.post("/api/v1/pis/compute/DZ-01")
        assert resp.status_code == 200
        data = resp.json()
        assert data["province_code"] == "DZ-01"
        assert data["composite_score"] > 0
        assert "dimension_scores" in data
        assert "health" in data["dimension_scores"]
        assert "category" in data
        assert data["category"] in ("Excellent", "Good", "Average", "Needs Improvement", "Critical")

    async def test_compute_all_scores(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        resp = await client.post("/api/v1/pis/compute")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 2

    async def test_list_scores(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        resp = await client.get("/api/v1/pis/scores")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1


class TestSnapshot:
    async def test_take_snapshot(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        resp = await client.post("/api/v1/pis/snapshot")
        assert resp.status_code == 200
        assert resp.json()["code"] == "OK"


class TestRiskDetection:
    async def test_scan_risks(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        resp = await client.post("/api/v1/pis/risks/scan")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    async def test_list_alerts(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        await client.post("/api/v1/pis/risks/scan")
        resp = await client.get("/api/v1/pis/alerts")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    async def test_resolve_alert(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        await client.post("/api/v1/pis/risks/scan")
        list_resp = await client.get("/api/v1/pis/alerts")
        alerts = list_resp.json()
        if alerts:
            alert_id = alerts[0]["id"]
            resp = await client.patch(f"/api/v1/pis/alerts/{alert_id}/resolve")
            assert resp.status_code == 200
            assert resp.json()["resolved"] is True


class TestRecommendations:
    async def test_generate_recommendations(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        resp = await client.post("/api/v1/pis/recommendations/generate")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    async def test_list_recommendations(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        await client.post("/api/v1/pis/recommendations/generate")
        resp = await client.get("/api/v1/pis/recommendations")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    async def test_list_recommendations_by_province(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        await client.post("/api/v1/pis/recommendations/generate")
        resp = await client.get("/api/v1/pis/recommendations?province_code=DZ-01")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)


class TestDashboard:
    async def test_dashboard_kpis(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        resp = await client.get("/api/v1/dashboard/kpis")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_provinces"] >= 2
        assert data["avg_composite_score"] > 0

    async def test_dashboard_map(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        resp = await client.get("/api/v1/dashboard/map")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 2

    async def test_dashboard_rankings(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute")
        resp = await client.get("/api/v1/dashboard/rankings")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["rank"] == 1

    async def test_dashboard_summary(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute")
        resp = await client.get("/api/v1/dashboard/summary")
        assert resp.status_code == 200
        data = resp.json()
        assert "kpis" in data
        assert "rankings" in data
        assert "alerts" in data
        assert "trends" in data

    async def test_dashboard_province_detail(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        resp = await client.get("/api/v1/dashboard/provinces/DZ-01")
        assert resp.status_code == 200
        data = resp.json()
        assert data["code"] == "DZ-01"
        assert data["composite_score"] is not None
        assert "dimension_scores" in data
        assert "strengths" in data
        assert "weaknesses" in data
        assert data["rank"] is not None

    async def test_dashboard_province_detail_not_found(self, client: AsyncClient):
        resp = await client.get("/api/v1/dashboard/provinces/DZ-99")
        assert resp.status_code == 404

    async def test_dashboard_trends(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        await client.post("/api/v1/pis/snapshot")
        resp = await client.get("/api/v1/dashboard/trends")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "period" in data[0]
        assert "avg_composite_score" in data[0]

    async def test_compute_idempotent(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        resp1 = await client.post("/api/v1/pis/compute/DZ-01")
        assert resp1.status_code == 200
        resp2 = await client.post("/api/v1/pis/compute/DZ-01")
        assert resp2.status_code == 200
        scores_resp = await client.get("/api/v1/pis/scores")
        scores = scores_resp.json()
        dz01_scores = [s for s in scores if s["province_code"] == "DZ-01" and s["year"] == 2026 and s["quarter"] == 1]
        assert len(dz01_scores) == 1

    async def test_scan_deduplicates_alerts(self, client: AsyncClient, seeded_provinces, seeded_indicators, seeded_config):
        await client.post("/api/v1/pis/compute/DZ-01")
        resp1 = await client.post("/api/v1/pis/risks/scan")
        assert resp1.status_code == 200
        count1 = len(resp1.json())
        resp2 = await client.post("/api/v1/pis/risks/scan")
        assert resp2.status_code == 200
        count2 = len(resp2.json())
        assert count2 == 0
