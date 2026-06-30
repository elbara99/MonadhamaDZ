"""Non-interactive seed for automated testing."""
import asyncio
import uuid
from datetime import date, datetime, timezone

from app.core.database import async_session_factory, engine
from app.core.security import hash_password
from app.repositories.document_repository import DocumentRepository
from app.repositories.indicator_repository import IndicatorRepository
from app.repositories.organization_repository import OrganizationRepository
from app.repositories.project_repository import ProjectRepository
from app.repositories.province_repository import ProvinceRepository
from app.repositories.report_repository import ReportRepository
from app.repositories.user_repository import UserRepository
from app.utils.enums import UserRole

ALGERIAN_PROVINCES = [
    {"code": "DZ-01", "name_ar": "أدرار", "name_fr": "Adrar", "population": 439700, "area": 427968, "region": "Sud-Ouest"},
    {"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
    {"code": "DZ-25", "name_ar": "قسنطينة", "name_fr": "Constantine", "population": 938000, "area": 2187, "region": "Nord-Est"},
    {"code": "DZ-31", "name_ar": "وهران", "name_fr": "Oran", "population": 1586000, "area": 2114, "region": "Nord-Ouest"},
    {"code": "DZ-19", "name_ar": "سطيف", "name_fr": "Sétif", "population": 1489000, "area": 6504, "region": "Nord-Est"},
]

ORGANIZATIONS = [
    {"code": "MIN-FIN", "name_ar": "وزارة المالية", "name_fr": "Ministère des Finances", "type": "ministry", "province_code": "DZ-16"},
    {"code": "MIN-EDU", "name_ar": "وزارة التربية", "name_fr": "Ministère de l'Éducation", "type": "ministry", "province_code": "DZ-16"},
    {"code": "DEP-ALG", "name_ar": "مديرية الجزائر", "name_fr": "Direction d'Alger", "type": "department", "province_code": "DZ-16"},
    {"code": "INS-ONS", "name_ar": "الديوان الوطني للإحصائيات", "name_fr": "Office National des Statistiques", "type": "institution", "province_code": "DZ-16"},
    {"code": "MUN-ORA", "name_ar": "بلدية وهران", "name_fr": "Commune d'Oran", "type": "municipality", "province_code": "DZ-31"},
]

async def seed():
    async with async_session_factory() as session:
        user_repo = UserRepository(session)
        existing = await user_repo.find_by_email("admin@monadhama.gov.dz")
        if existing is None:
            await user_repo.create(email="admin@monadhama.gov.dz", hashed_password=hash_password("admin123"), full_name="Super Admin", role=UserRole.SUPER_ADMIN, is_superuser=True)

        province_repo = ProvinceRepository(session)
        for p in ALGERIAN_PROVINCES:
            if await province_repo.get_by_code(p["code"]) is None:
                await province_repo.create(**p)

        org_repo = OrganizationRepository(session)
        org_ids = {}
        for o in ORGANIZATIONS:
            existing_o = await org_repo.get_by_code(o["code"])
            if existing_o is None:
                inst = await org_repo.create(**o)
                org_ids[o["code"]] = inst.id
            else:
                org_ids[o["code"]] = existing_o.id

        project_repo = ProjectRepository(session)
        projects_data = [
            {"title": "Extension du métro d'Alger", "description": "Extension de 15 km", "budget": 85000000000, "status": "in_progress", "province_code": "DZ-16", "organization_id": org_ids.get("DEP-ALG"), "start_date": date(2023, 1, 15), "end_date": date(2026, 6, 30)},
            {"title": "Nouveaux établissements scolaires", "description": "Construction de 50 écoles", "budget": 5000000000, "status": "planned", "province_code": "DZ-19", "organization_id": org_ids.get("MIN-EDU"), "start_date": date(2025, 9, 1), "end_date": date(2027, 12, 31)},
        ]
        for p in projects_data:
            await project_repo.create(**p)

        indicator_repo = IndicatorRepository(session)
        indicators_data = [
            {"name": "Taux de scolarisation", "value": 97.2, "target": 100.0, "unit": "%", "year": 2024, "province_code": "DZ-16"},
            {"name": "Taux de chômage", "value": 11.8, "target": 8.0, "unit": "%", "year": 2024, "province_code": "DZ-16"},
        ]
        for i in indicators_data:
            await indicator_repo.create(**i)

        report_repo = ReportRepository(session)
        reports_data = [
            {"title": "Rapport économique annuel 2024", "description": "Analyse économique", "generated_at": datetime(2024, 12, 31, tzinfo=timezone.utc), "organization_id": org_ids.get("MIN-FIN")},
            {"title": "Rapport ONS T4 2024", "description": "Indicateurs macroéconomiques", "generated_at": datetime(2025, 1, 15, tzinfo=timezone.utc), "organization_id": org_ids.get("INS-ONS")},
        ]
        for r in reports_data:
            await report_repo.create(**r)

        doc_repo = DocumentRepository(session)
        await doc_repo.create(filename="rapport-2024.pdf", file_path="/docs/rapport-2024.pdf", mime_type="application/pdf", size=2450000, document_type="report", organization_id=org_ids.get("MIN-FIN"))
        await doc_repo.create(filename="etude-education.pdf", file_path="/docs/etude.pdf", mime_type="application/pdf", size=1800000, document_type="study", organization_id=org_ids.get("MIN-EDU"))

        await session.commit()
        print("Seed complete")

async def main():
    try:
        await seed()
    finally:
        await engine.dispose()

asyncio.run(main())
