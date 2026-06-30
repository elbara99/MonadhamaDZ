from __future__ import annotations

import asyncio
import getpass
import uuid
from datetime import date, datetime, timedelta, timezone

from app.core.database import async_session_factory, engine
from app.core.security import hash_password
from app.models.document import Document
from app.models.indicator import Indicator
from app.models.organization import Organization
from app.models.project import Project
from app.models.province import Province
from app.models.report import Report
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
    {"code": "DZ-02", "name_ar": "الشلف", "name_fr": "Chlef", "population": 1002000, "area": 4975, "region": "Nord-Ouest"},
    {"code": "DZ-03", "name_ar": "الأغواط", "name_fr": "Laghouat", "population": 477000, "area": 25057, "region": "Sud-Ouest"},
    {"code": "DZ-04", "name_ar": "أم البواقي", "name_fr": "Oum El Bouaghi", "population": 734000, "area": 6768, "region": "Nord-Est"},
    {"code": "DZ-05", "name_ar": "باتنة", "name_fr": "Batna", "population": 1198000, "area": 12192, "region": "Nord-Est"},
    {"code": "DZ-06", "name_ar": "بجاية", "name_fr": "Béjaïa", "population": 912000, "area": 3268, "region": "Nord-Est"},
    {"code": "DZ-07", "name_ar": "بسكرة", "name_fr": "Biskra", "population": 725000, "area": 20986, "region": "Sud-Est"},
    {"code": "DZ-08", "name_ar": "بشار", "name_fr": "Béchar", "population": 274000, "area": 161400, "region": "Sud-Ouest"},
    {"code": "DZ-09", "name_ar": "البليدة", "name_fr": "Blida", "population": 1002000, "area": 1696, "region": "Centre"},
    {"code": "DZ-10", "name_ar": "البويرة", "name_fr": "Bouira", "population": 695000, "area": 4439, "region": "Centre"},
    {"code": "DZ-11", "name_ar": "تمنراست", "name_fr": "Tamanrasset", "population": 115000, "area": 556000, "region": "Sud-Est"},
    {"code": "DZ-12", "name_ar": "تبسة", "name_fr": "Tébessa", "population": 657000, "area": 13878, "region": "Nord-Est"},
    {"code": "DZ-13", "name_ar": "تلمسان", "name_fr": "Tlemcen", "population": 949000, "area": 9061, "region": "Nord-Ouest"},
    {"code": "DZ-14", "name_ar": "تيارت", "name_fr": "Tiaret", "population": 842000, "area": 20673, "region": "Centre"},
    {"code": "DZ-15", "name_ar": "تيزي وزو", "name_fr": "Tizi Ouzou", "population": 1125000, "area": 2958, "region": "Nord-Est"},
    {"code": "DZ-16", "name_ar": "الجزائر", "name_fr": "Alger", "population": 2982000, "area": 1190, "region": "Centre"},
    {"code": "DZ-17", "name_ar": "الجلفة", "name_fr": "Djelfa", "population": 1092000, "area": 66355, "region": "Centre"},
    {"code": "DZ-18", "name_ar": "جيجل", "name_fr": "Jijel", "population": 636000, "area": 2577, "region": "Nord-Est"},
    {"code": "DZ-19", "name_ar": "سطيف", "name_fr": "Sétif", "population": 1489000, "area": 6504, "region": "Nord-Est"},
    {"code": "DZ-20", "name_ar": "سعيدة", "name_fr": "Saïda", "population": 342000, "area": 6964, "region": "Nord-Ouest"},
    {"code": "DZ-21", "name_ar": "سكيكدة", "name_fr": "Skikda", "population": 904000, "area": 4137, "region": "Nord-Est"},
    {"code": "DZ-22", "name_ar": "سيدي بلعباس", "name_fr": "Sidi Bel Abbès", "population": 604000, "area": 9150, "region": "Nord-Ouest"},
    {"code": "DZ-23", "name_ar": "عنابة", "name_fr": "Annaba", "population": 609000, "area": 1439, "region": "Nord-Est"},
    {"code": "DZ-24", "name_ar": "قالمة", "name_fr": "Guelma", "population": 482000, "area": 4101, "region": "Nord-Est"},
    {"code": "DZ-25", "name_ar": "قسنطينة", "name_fr": "Constantine", "population": 938000, "area": 2187, "region": "Nord-Est"},
    {"code": "DZ-26", "name_ar": "المدية", "name_fr": "Médéa", "population": 820000, "area": 8708, "region": "Centre"},
    {"code": "DZ-27", "name_ar": "مستغانم", "name_fr": "Mostaganem", "population": 737000, "area": 2269, "region": "Nord-Ouest"},
    {"code": "DZ-28", "name_ar": "مسيلة", "name_fr": "M'Sila", "population": 990000, "area": 18175, "region": "Centre"},
    {"code": "DZ-29", "name_ar": "معسكر", "name_fr": "Mascara", "population": 784000, "area": 5941, "region": "Nord-Ouest"},
    {"code": "DZ-30", "name_ar": "ورقلة", "name_fr": "Ouargla", "population": 558000, "area": 211980, "region": "Sud-Est"},
    {"code": "DZ-31", "name_ar": "وهران", "name_fr": "Oran", "population": 1586000, "area": 2114, "region": "Nord-Ouest"},
    {"code": "DZ-32", "name_ar": "البيض", "name_fr": "El Bayadh", "population": 229000, "area": 78970, "region": "Sud-Ouest"},
    {"code": "DZ-33", "name_ar": "إليزي", "name_fr": "Illizi", "population": 54000, "area": 285000, "region": "Sud-Est"},
    {"code": "DZ-34", "name_ar": "برج بوعريريج", "name_fr": "Bordj Bou Arreridj", "population": 667000, "area": 4115, "region": "Centre"},
    {"code": "DZ-35", "name_ar": "بومرداس", "name_fr": "Boumerdès", "population": 802000, "area": 1556, "region": "Centre"},
    {"code": "DZ-36", "name_ar": "الطارف", "name_fr": "El Taref", "population": 408000, "area": 2839, "region": "Nord-Est"},
    {"code": "DZ-37", "name_ar": "تندوف", "name_fr": "Tindouf", "population": 58000, "area": 159000, "region": "Sud-Ouest"},
    {"code": "DZ-38", "name_ar": "تسمسيلت", "name_fr": "Tissemsilt", "population": 295000, "area": 3152, "region": "Centre"},
    {"code": "DZ-39", "name_ar": "الوادي", "name_fr": "El Oued", "population": 673000, "area": 54573, "region": "Sud-Est"},
    {"code": "DZ-40", "name_ar": "خنشلة", "name_fr": "Khenchela", "population": 387000, "area": 9811, "region": "Nord-Est"},
    {"code": "DZ-41", "name_ar": "سوق أهراس", "name_fr": "Souk Ahras", "population": 440000, "area": 4541, "region": "Nord-Est"},
    {"code": "DZ-42", "name_ar": "تيبازة", "name_fr": "Tipaza", "population": 592000, "area": 1660, "region": "Centre"},
    {"code": "DZ-43", "name_ar": "ميلة", "name_fr": "Mila", "population": 768000, "area": 3540, "region": "Nord-Est"},
    {"code": "DZ-44", "name_ar": "عين الدفلى", "name_fr": "Aïn Defla", "population": 766000, "area": 4897, "region": "Centre"},
    {"code": "DZ-45", "name_ar": "النعامة", "name_fr": "Naâma", "population": 209000, "area": 29867, "region": "Sud-Ouest"},
    {"code": "DZ-46", "name_ar": "عين تموشنت", "name_fr": "Aïn Témouchent", "population": 384000, "area": 2379, "region": "Nord-Ouest"},
    {"code": "DZ-47", "name_ar": "غرداية", "name_fr": "Ghardaïa", "population": 416000, "area": 86105, "region": "Sud-Est"},
    {"code": "DZ-48", "name_ar": "غليزان", "name_fr": "Relizane", "population": 727000, "area": 4870, "region": "Nord-Ouest"},
    {"code": "DZ-49", "name_ar": "تيميمون", "name_fr": "Timimoun", "population": 122000, "area": 65203, "region": "Sud-Ouest"},
    {"code": "DZ-50", "name_ar": "برج باجي مختار", "name_fr": "Bordj Badji Mokhtar", "population": 16000, "area": 120026, "region": "Sud-Est"},
    {"code": "DZ-51", "name_ar": "أولاد جلال", "name_fr": "Ouled Djellal", "population": 174000, "area": 27328, "region": "Sud-Est"},
    {"code": "DZ-52", "name_ar": "بني عباس", "name_fr": "Béni Abbès", "population": 50700, "area": 101350, "region": "Sud-Ouest"},
    {"code": "DZ-53", "name_ar": "عين صالح", "name_fr": "In Salah", "population": 70500, "area": 113730, "region": "Sud-Est"},
    {"code": "DZ-54", "name_ar": "عين قزام", "name_fr": "In Guezzam", "population": 11000, "area": 70717, "region": "Sud-Est"},
    {"code": "DZ-55", "name_ar": "تقرت", "name_fr": "Touggourt", "population": 389000, "area": 77218, "region": "Sud-Est"},
    {"code": "DZ-56", "name_ar": "جانت", "name_fr": "Djanet", "population": 25000, "area": 86085, "region": "Sud-Est"},
    {"code": "DZ-57", "name_ar": "المغير", "name_fr": "El M'Ghair", "population": 162000, "area": 56470, "region": "Sud-Est"},
    {"code": "DZ-58", "name_ar": "المنيعة", "name_fr": "El Menia", "population": 72000, "area": 123590, "region": "Sud-Est"},
]

ORGANIZATIONS = [
    {"code": "MIN-INT", "name_ar": "وزارة الداخلية", "name_fr": "Ministère de l'Intérieur", "type": "ministry", "province_code": "DZ-16"},
    {"code": "MIN-FIN", "name_ar": "وزارة المالية", "name_fr": "Ministère des Finances", "type": "ministry", "province_code": "DZ-16"},
    {"code": "MIN-SAN", "name_ar": "وزارة الصحة", "name_fr": "Ministère de la Santé", "type": "ministry", "province_code": "DZ-16"},
    {"code": "MIN-EDU", "name_ar": "وزارة التربية الوطنية", "name_fr": "Ministère de l'Éducation", "type": "ministry", "province_code": "DZ-16"},
    {"code": "MIN-AGR", "name_ar": "وزارة الفلاحة", "name_fr": "Ministère de l'Agriculture", "type": "ministry", "province_code": "DZ-16"},
    {"code": "MIN-TRA", "name_ar": "وزارة النقل", "name_fr": "Ministère des Transports", "type": "ministry", "province_code": "DZ-16"},
    {"code": "MIN-HAB", "name_ar": "وزارة السكن", "name_fr": "Ministère de l'Habitat", "type": "ministry", "province_code": "DZ-16"},
    {"code": "DEP-ALG", "name_ar": "مديرية الجزائر", "name_fr": "Direction d'Alger", "type": "department", "province_code": "DZ-16"},
    {"code": "DEP-ORA", "name_ar": "مديرية وهران", "name_fr": "Direction d'Oran", "type": "department", "province_code": "DZ-31"},
    {"code": "DEP-CON", "name_ar": "مديرية قسنطينة", "name_fr": "Direction de Constantine", "type": "department", "province_code": "DZ-25"},
    {"code": "DEP-SET", "name_ar": "مديرية سطيف", "name_fr": "Direction de Sétif", "type": "department", "province_code": "DZ-19"},
    {"code": "DEP-ANN", "name_ar": "مديرية عنابة", "name_fr": "Direction d'Annaba", "type": "department", "province_code": "DZ-23"},
    {"code": "INS-ONS", "name_ar": "الديوان الوطني للإحصائيات", "name_fr": "Office National des Statistiques", "type": "institution", "province_code": "DZ-16"},
    {"code": "INS-CNT", "name_ar": "المجلس الوطني الاقتصادي", "name_fr": "Conseil National Économique", "type": "institution", "province_code": "DZ-16"},
    {"code": "MUN-ALG", "name_ar": "بلدية الجزائر", "name_fr": "Commune d'Alger", "type": "municipality", "province_code": "DZ-16"},
    {"code": "MUN-ORA", "name_ar": "بلدية وهران", "name_fr": "Commune d'Oran", "type": "municipality", "province_code": "DZ-31"},
]

INDICATORS_DATA = [
    {"name": "Taux de scolarisation", "value": 97.2, "target": 100.0, "unit": "%", "year": 2024, "province_code": "DZ-16"},
    {"name": "Taux de scolarisation", "value": 94.5, "target": 100.0, "unit": "%", "year": 2024, "province_code": "DZ-31"},
    {"name": "Taux de scolarisation", "value": 96.1, "target": 100.0, "unit": "%", "year": 2024, "province_code": "DZ-25"},
    {"name": "Taux de chômage", "value": 11.8, "target": 8.0, "unit": "%", "year": 2024, "province_code": "DZ-16"},
    {"name": "Taux de chômage", "value": 13.2, "target": 8.0, "unit": "%", "year": 2024, "province_code": "DZ-31"},
    {"name": "Taux de chômage", "value": 12.5, "target": 8.0, "unit": "%", "year": 2024, "province_code": "DZ-25"},
    {"name": "PIB par habitant", "value": 452000, "target": 500000, "unit": "DZD", "year": 2024, "province_code": "DZ-16"},
    {"name": "PIB par habitant", "value": 398000, "target": 450000, "unit": "DZD", "year": 2024, "province_code": "DZ-31"},
    {"name": "Taux d'accès à l'eau potable", "value": 89.5, "target": 95.0, "unit": "%", "year": 2024, "province_code": "DZ-16"},
    {"name": "Taux d'accès à l'eau potable", "value": 78.3, "target": 90.0, "unit": "%", "year": 2024, "province_code": "DZ-01"},
    {"name": "Couverture sanitaire", "value": 85.0, "target": 90.0, "unit": "%", "year": 2024, "province_code": "DZ-16"},
    {"name": "Couverture sanitaire", "value": 62.0, "target": 80.0, "unit": "%", "year": 2024, "province_code": "DZ-11"},
    {"name": "Taux d'électrification rurale", "value": 99.2, "target": 100.0, "unit": "%", "year": 2024, "province_code": "DZ-16"},
    {"name": "Taux d'électrification rurale", "value": 92.5, "target": 100.0, "unit": "%", "year": 2024, "province_code": "DZ-01"},
    {"name": "Nombre d'établissements scolaires", "value": 2150, "target": 2300, "unit": "écoles", "year": 2024, "province_code": "DZ-16"},
    {"name": "Nombre d'établissements scolaires", "value": 890, "target": 1000, "unit": "écoles", "year": 2024, "province_code": "DZ-31"},
]

PROJECTS_DATA = [
    {"title": "Extension du réseau de métro d'Alger", "description": "Extension de 15 km du métro d'Alger vers les nouvelles zones urbaines", "budget": 85000000000, "status": "in_progress", "province_code": "DZ-16", "start_date": date(2023, 1, 15), "end_date": date(2026, 6, 30)},
    {"title": "Numérisation des services administratifs", "description": "Plateforme numérique pour l'administration publique", "budget": 12000000000, "status": "in_progress", "province_code": "DZ-16", "start_date": date(2024, 3, 1), "end_date": date(2027, 12, 31)},
    {"title": "Barrage vert — reboisement des hauts plateaux", "description": "Programme de reboisement sur 100 000 hectares", "budget": 25000000000, "status": "planned", "province_code": "DZ-17", "start_date": date(2025, 9, 1), "end_date": date(2030, 12, 31)},
    {"title": "Construction d'hôpitaux spécialisés", "description": "5 hôpitaux spécialisés dans les provinces du Sud", "budget": 45000000000, "status": "planned", "province_code": "DZ-01", "start_date": date(2025, 6, 1), "end_date": date(2028, 12, 31)},
    {"title": "Autoroute Est-Ouest — section Sud", "description": "Achèvement de la liaison autoroutière vers les provinces du Sud", "budget": 120000000000, "status": "in_progress", "province_code": "DZ-30", "start_date": date(2022, 1, 1), "end_date": date(2027, 6, 30)},
    {"title": "Station de dessalement d'eau de mer", "description": "Construction de 3 stations de dessalement dans l'Ouest", "budget": 38000000000, "status": "in_progress", "province_code": "DZ-31", "start_date": date(2024, 6, 1), "end_date": date(2027, 3, 31)},
    {"title": "Programme national d'habitat", "description": "Construction de 500 000 logements à travers le pays", "budget": 800000000000, "status": "in_progress", "province_code": "DZ-16", "start_date": date(2023, 1, 1), "end_date": date(2029, 12, 31)},
    {"title": "Parc photovoltaïque 2000 MW", "description": "Installation de panneaux solaires dans le Sud algérien", "budget": 180000000000, "status": "planned", "province_code": "DZ-11", "start_date": date(2025, 3, 1), "end_date": date(2029, 6, 30)},
    {"title": "Centre de formation professionnelle", "description": "Construction de 50 centres de formation professionnelle", "budget": 15000000000, "status": "completed", "province_code": "DZ-19", "start_date": date(2020, 1, 1), "end_date": date(2024, 12, 31)},
    {"title": "Aménagement urbain — Constantine", "description": "Réhabilitation du centre historique et modernisation des transports", "budget": 28000000000, "status": "in_progress", "province_code": "DZ-25", "start_date": date(2024, 9, 1), "end_date": date(2028, 12, 31)},
]

REPORTS_DATA = [
    {"title": "Rapport économique annuel 2024", "description": "Analyse complète de la performance économique nationale", "generated_at": datetime(2024, 12, 31, 10, 0, 0, tzinfo=timezone.utc)},
    {"title": "Rapport sur le développement humain", "description": "Indice de développement humain par province", "generated_at": datetime(2024, 11, 15, 10, 0, 0, tzinfo=timezone.utc)},
    {"title": "Étude sectorielle — Éducation", "description": "Analyse des performances du secteur éducatif", "generated_at": datetime(2024, 10, 1, 10, 0, 0, tzinfo=timezone.utc)},
    {"title": "Rapport trimestriel ONS", "description": "Indicateurs macroéconomiques T4 2024", "generated_at": datetime(2025, 1, 15, 10, 0, 0, tzinfo=timezone.utc)},
    {"title": "Plan national d'investissement 2025-2030", "description": "Stratégie d'investissement public", "generated_at": datetime(2024, 12, 1, 10, 0, 0, tzinfo=timezone.utc)},
]

now = lambda: datetime.now(timezone.utc)


async def seed() -> None:
    email = input("Super admin email [admin@monadhama.gov.dz]: ") or "admin@monadhama.gov.dz"
    password = getpass.getpass("Super admin password [default: changeme123]: ") or "changeme123"
    full_name = input("Super admin full name [Super Admin]: ") or "Super Admin"

    async with async_session_factory() as session:
        user_repo = UserRepository(session)
        existing = await user_repo.find_by_email(email)
        if existing is None:
            await user_repo.create(email=email, hashed_password=hash_password(password), full_name=full_name, role=UserRole.SUPER_ADMIN, is_superuser=True)
            print(f"Super admin created: {email}")

        province_repo = ProvinceRepository(session)
        org_repo = OrganizationRepository(session)
        project_repo = ProjectRepository(session)
        indicator_repo = IndicatorRepository(session)
        report_repo = ReportRepository(session)
        doc_repo = DocumentRepository(session)

        for p in ALGERIAN_PROVINCES:
            existing_p = await province_repo.get_by_code(p["code"])
            if existing_p is None:
                await province_repo.create(**p)
        print(f"Provinces: {len(ALGERIAN_PROVINCES)} seeded")

        org_ids = {}
        for o in ORGANIZATIONS:
            existing_o = await org_repo.get_by_code(o["code"])
            if existing_o is None:
                inst = await org_repo.create(**o)
                org_ids[o["code"]] = inst.id
            else:
                org_ids[o["code"]] = existing_o.id
        print(f"Organizations: {len(ORGANIZATIONS)} seeded")

        for p in PROJECTS_DATA:
            data = dict(p)
            if "MIN-HAB" in str(data.get("title", "")):
                data["organization_id"] = org_ids.get("MIN-HAB")
            elif "metro" in str(data.get("description", "")):
                data["organization_id"] = org_ids.get("MIN-TRA")
            elif "Numérisation" in str(data.get("title", "")):
                data["organization_id"] = org_ids.get("MIN-INT")
            elif "sanit" in str(data.get("description", "")):
                data["organization_id"] = org_ids.get("MIN-SAN")
            elif "formation" in str(data.get("title", "")):
                data["organization_id"] = org_ids.get("MIN-EDU")
            elif "Autoroute" in str(data.get("title", "")):
                data["organization_id"] = org_ids.get("MIN-TRA")
            elif "dessalement" in str(data.get("title", "")):
                data["organization_id"] = org_ids.get("MIN-AGR")
            elif "habitat" in str(data.get("title", "")):
                data["organization_id"] = org_ids.get("MIN-HAB")
            elif "photovoltaïque" in str(data.get("title", "")):
                data["organization_id"] = org_ids.get("MIN-INT")
            elif "urbain" in str(data.get("title", "")):
                data["organization_id"] = org_ids.get("DEP-CON")
            await project_repo.create(**data)
        print(f"Projects: {len(PROJECTS_DATA)} seeded")

        ind_ids = []
        for ind in INDICATORS_DATA:
            inst = await indicator_repo.create(**ind)
            ind_ids.append(inst.id)
        print(f"Indicators: {len(INDICATORS_DATA)} seeded")

        report_ids = []
        for r in REPORTS_DATA:
            is_ons = "ONS" in r.get("title", "")
            data = dict(r)
            if is_ons:
                data["organization_id"] = org_ids.get("INS-ONS")
            else:
                data["organization_id"] = org_ids.get("MIN-FIN")
            inst = await report_repo.create(**data)
            report_ids.append(inst.id)
        print(f"Reports: {len(REPORTS_DATA)} seeded")

        await doc_repo.create(
            filename="rapport-annuel-2024.pdf",
            file_path="/documents/rapport-annuel-2024.pdf",
            mime_type="application/pdf",
            size=2450000,
            document_type="report",
            organization_id=org_ids.get("MIN-FIN"),
        )
        await doc_repo.create(
            filename="plan-investissement-2025.pdf",
            file_path="/documents/plan-investissement-2025.pdf",
            mime_type="application/pdf",
            size=1800000,
            document_type="report",
            organization_id=org_ids.get("MIN-FIN"),
        )
        print("Documents: 2 seeded")

        await session.commit()
        print("\nSeed completed successfully!")


async def main() -> None:
    try:
        await seed()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
