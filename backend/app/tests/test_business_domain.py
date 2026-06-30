"""Integration tests for all 6 business domain entities."""

from __future__ import annotations

import pytest
from httpx import AsyncClient

from app.core.config import settings
from app.core.security import hash_password
from app.repositories.user_repository import UserRepository
from app.tests.conftest import test_session_factory
from app.utils.enums import UserRole


@pytest.fixture(autouse=True)
def _use_setup_database(setup_database):
    pass


@pytest.fixture
async def admin_token(client: AsyncClient) -> str:
    async with test_session_factory() as session:
        repo = UserRepository(session)
        await repo.create(
            email="admin@test.dz",
            hashed_password=hash_password("password123"),
            full_name="Test Admin",
            role=UserRole.SUPER_ADMIN,
            is_superuser=True,
        )
        await session.commit()
    resp = await client.post(
        f"{settings.API_V1_PREFIX}/auth/login",
        json={"email": "admin@test.dz", "password": "password123"},
    )
    return resp.json()["access_token"]


@pytest.fixture
async def auth_headers(admin_token: str) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}


class TestProvinces:
    async def test_create_province(self, client: AsyncClient, auth_headers: dict):
        resp = await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-99", "name_ar": "ولاية تجريبية", "name_fr": "Province Test", "population": 100000, "area": 5000, "region": "Centre"},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        assert resp.json()["code"] == "DZ-99"

    async def test_get_province(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        resp = await client.get(f"{settings.API_V1_PREFIX}/provinces/DZ-16", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["code"] == "DZ-16"

    async def test_get_province_not_found(self, client: AsyncClient, auth_headers: dict):
        resp = await client.get(f"{settings.API_V1_PREFIX}/provinces/DZ-99", headers=auth_headers)
        assert resp.status_code == 404

    async def test_list_provinces(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        resp = await client.get(f"{settings.API_V1_PREFIX}/provinces", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert data["total"] >= 1

    async def test_create_province_duplicate(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        resp = await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        assert resp.status_code == 409

    async def test_update_province(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-98", "name_ar": "ولاية", "name_fr": "Wilaya", "population": 100000, "area": 5000, "region": "Centre"},
            headers=auth_headers,
        )
        resp = await client.patch(
            f"{settings.API_V1_PREFIX}/provinces/DZ-98",
            json={"population": 200000},
            headers=auth_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["population"] == 200000

    async def test_delete_province(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-97", "name_ar": "ولاية", "name_fr": "Wilaya", "population": 100000, "area": 5000, "region": "Centre"},
            headers=auth_headers,
        )
        resp = await client.delete(f"{settings.API_V1_PREFIX}/provinces/DZ-97", headers=auth_headers)
        assert resp.status_code == 200


class TestOrganizations:
    async def test_create_organization(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        resp = await client.post(
            f"{settings.API_V1_PREFIX}/organizations",
            json={"code": "MIN-TEST", "name_ar": "وزارة الاختبار", "name_fr": "Ministère Test", "type": "ministry", "province_code": "DZ-16"},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        assert resp.json()["code"] == "MIN-TEST"

    async def test_get_organization(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        org_resp = await client.post(
            f"{settings.API_V1_PREFIX}/organizations",
            json={"code": "MIN-FIN", "name_ar": "وزارة المالية", "name_fr": "Ministère des Finances", "type": "ministry", "province_code": "DZ-16"},
            headers=auth_headers,
        )
        org_id = org_resp.json()["id"]
        resp = await client.get(f"{settings.API_V1_PREFIX}/organizations/{org_id}", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["id"] == org_id

    async def test_list_organizations(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        await client.post(
            f"{settings.API_V1_PREFIX}/organizations",
            json={"code": "MIN-FIN", "name_ar": "وزارة المالية", "name_fr": "Ministère des Finances", "type": "ministry", "province_code": "DZ-16"},
            headers=auth_headers,
        )
        resp = await client.get(f"{settings.API_V1_PREFIX}/organizations", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["total"] >= 1

    async def test_get_organization_not_found(self, client: AsyncClient, auth_headers: dict):
        resp = await client.get(
            f"{settings.API_V1_PREFIX}/organizations/00000000-0000-0000-0000-000000000000",
            headers=auth_headers,
        )
        assert resp.status_code == 404


class TestProjects:
    async def _seed_org(self, client: AsyncClient, auth_headers: dict, code: str) -> str:
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        resp = await client.post(
            f"{settings.API_V1_PREFIX}/organizations",
            json={"code": code, "name_ar": "مديرية", "name_fr": "Direction", "type": "department", "province_code": "DZ-16"},
            headers=auth_headers,
        )
        return resp.json()["id"]

    async def test_create_project(self, client: AsyncClient, auth_headers: dict):
        org_id = await self._seed_org(client, auth_headers, "DEP-PRJ1")
        resp = await client.post(
            f"{settings.API_V1_PREFIX}/projects",
            json={
                "title": "Test Project",
                "description": "A test project",
                "budget": 1000000,
                "status": "planned",
                "province_code": "DZ-16",
                "organization_id": org_id,
                "start_date": "2025-01-01",
                "end_date": "2026-01-01",
            },
            headers=auth_headers,
        )
        assert resp.status_code == 201
        assert resp.json()["title"] == "Test Project"

    async def test_list_projects(self, client: AsyncClient, auth_headers: dict):
        org_id = await self._seed_org(client, auth_headers, "DEP-PRJ2")
        await client.post(
            f"{settings.API_V1_PREFIX}/projects",
            json={
                "title": "Project A",
                "description": "Desc A",
                "budget": 1000000,
                "status": "planned",
                "province_code": "DZ-16",
                "organization_id": org_id,
                "start_date": "2025-01-01",
                "end_date": "2026-01-01",
            },
            headers=auth_headers,
        )
        resp = await client.get(f"{settings.API_V1_PREFIX}/projects", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["total"] >= 1

    async def test_filter_projects_by_status(self, client: AsyncClient, auth_headers: dict):
        org_id = await self._seed_org(client, auth_headers, "DEP-PRJ3")
        await client.post(
            f"{settings.API_V1_PREFIX}/projects",
            json={
                "title": "Active Project",
                "description": "Desc",
                "budget": 1000000,
                "status": "in_progress",
                "province_code": "DZ-16",
                "organization_id": org_id,
                "start_date": "2025-01-01",
                "end_date": "2026-01-01",
            },
            headers=auth_headers,
        )
        resp = await client.get(
            f"{settings.API_V1_PREFIX}/projects?status=in_progress", headers=auth_headers
        )
        assert resp.status_code == 200
        assert all(item["status"] == "in_progress" for item in resp.json()["items"])


class TestIndicators:
    async def test_create_indicator(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        resp = await client.post(
            f"{settings.API_V1_PREFIX}/indicators",
            json={"name": "Taux Test", "value": 75.0, "target": 100.0, "unit": "%", "year": 2024, "province_code": "DZ-16"},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        assert resp.json()["name"] == "Taux Test"

    async def test_list_indicators(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        await client.post(
            f"{settings.API_V1_PREFIX}/indicators",
            json={"name": "Taux A", "value": 50.0, "target": 100.0, "unit": "%", "year": 2024, "province_code": "DZ-16"},
            headers=auth_headers,
        )
        resp = await client.get(f"{settings.API_V1_PREFIX}/indicators", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["total"] >= 1

    async def test_filter_indicators_by_province(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        await client.post(
            f"{settings.API_V1_PREFIX}/indicators",
            json={"name": "Taux", "value": 50.0, "target": 100.0, "unit": "%", "year": 2024, "province_code": "DZ-16"},
            headers=auth_headers,
        )
        resp = await client.get(
            f"{settings.API_V1_PREFIX}/indicators?province_code=DZ-16", headers=auth_headers
        )
        assert resp.status_code == 200
        assert all(item["province_code"] == "DZ-16" for item in resp.json()["items"])


class TestReports:
    async def test_create_report(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        org_resp = await client.post(
            f"{settings.API_V1_PREFIX}/organizations",
            json={"code": "INS-RPT", "name_ar": "مؤسسة", "name_fr": "Institution", "type": "institution", "province_code": "DZ-16"},
            headers=auth_headers,
        )
        resp = await client.post(
            f"{settings.API_V1_PREFIX}/reports",
            json={
                "title": "Rapport Test",
                "description": "Description",
                "generated_at": "2024-12-31T00:00:00Z",
                "organization_id": org_resp.json()["id"],
            },
            headers=auth_headers,
        )
        assert resp.status_code == 201
        assert resp.json()["title"] == "Rapport Test"

    async def test_list_reports(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        org_resp = await client.post(
            f"{settings.API_V1_PREFIX}/organizations",
            json={"code": "INS-RPT2", "name_ar": "مؤسسة", "name_fr": "Institution", "type": "institution", "province_code": "DZ-16"},
            headers=auth_headers,
        )
        await client.post(
            f"{settings.API_V1_PREFIX}/reports",
            json={
                "title": "Rapport Test",
                "description": "Desc",
                "generated_at": "2024-12-31T00:00:00Z",
                "organization_id": org_resp.json()["id"],
            },
            headers=auth_headers,
        )
        resp = await client.get(f"{settings.API_V1_PREFIX}/reports", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["total"] >= 1


class TestDocuments:
    async def test_create_document(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        org_resp = await client.post(
            f"{settings.API_V1_PREFIX}/organizations",
            json={"code": "MIN-DOC", "name_ar": "وزارة", "name_fr": "Ministère", "type": "ministry", "province_code": "DZ-16"},
            headers=auth_headers,
        )
        resp = await client.post(
            f"{settings.API_V1_PREFIX}/documents",
            json={
                "filename": "test.pdf",
                "file_path": "/docs/test.pdf",
                "mime_type": "application/pdf",
                "size": 1000,
                "document_type": "report",
                "organization_id": org_resp.json()["id"],
            },
            headers=auth_headers,
        )
        assert resp.status_code == 201
        assert resp.json()["filename"] == "test.pdf"

    async def test_list_documents(self, client: AsyncClient, auth_headers: dict):
        await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
            headers=auth_headers,
        )
        org_resp = await client.post(
            f"{settings.API_V1_PREFIX}/organizations",
            json={"code": "MIN-DOC2", "name_ar": "وزارة", "name_fr": "Ministère", "type": "ministry", "province_code": "DZ-16"},
            headers=auth_headers,
        )
        await client.post(
            f"{settings.API_V1_PREFIX}/documents",
            json={
                "filename": "doc1.pdf",
                "file_path": "/docs/doc1.pdf",
                "mime_type": "application/pdf",
                "size": 1000,
                "document_type": "report",
                "organization_id": org_resp.json()["id"],
            },
            headers=auth_headers,
        )
        resp = await client.get(f"{settings.API_V1_PREFIX}/documents", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["total"] >= 1


class TestSorting:
    async def test_sort_by_population_desc(self, client: AsyncClient, auth_headers: dict):
        for item in [("DZ-16", "الجزائر", "Alger", 2982000),
                     ("DZ-31", "وهران", "Oran", 1586000),
                     ("DZ-25", "قسنطينة", "Constantine", 938000)]:
            code, ar, fr, pop = item
            await client.post(
                f"{settings.API_V1_PREFIX}/provinces",
                json={"code": code, "name_ar": ar, "name_fr": fr, "population": pop, "area": 1000, "region": "Centre"},
                headers=auth_headers,
            )
        resp = await client.get(
            f"{settings.API_V1_PREFIX}/provinces?sort_by=population&sort_order=desc", headers=auth_headers
        )
        assert resp.status_code == 200
        data = resp.json()["items"]
        for i in range(len(data) - 1):
            assert data[i]["population"] >= data[i + 1]["population"]


class TestSecurity:
    async def test_unauthorized_create_province(self, client: AsyncClient):
        resp = await client.post(
            f"{settings.API_V1_PREFIX}/provinces",
            json={"code": "DZ-XX", "name_ar": "Test", "name_fr": "Test", "population": 1, "area": 1, "region": "Centre"},
        )
        assert resp.status_code == 401
