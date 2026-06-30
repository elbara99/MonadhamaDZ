"""Seed PIS configuration: default dimension weights."""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import async_session_factory
from app.repositories.pis_repository import PISConfigRepository

DIMENSIONS = [
    ("health", 0.20, "Healthcare", "Santé", "الصحة"),
    ("education", 0.15, "Education", "Éducation", "التعليم"),
    ("economy", 0.25, "Economy", "Économie", "الاقتصاد"),
    ("infrastructure", 0.15, "Infrastructure", "Infrastructure", "البنية التحتية"),
    ("environment", 0.10, "Environment", "Environnement", "البيئة"),
    ("employment", 0.05, "Employment", "Emploi", "التوظيف"),
    ("security", 0.03, "Security", "Sécurité", "الأمن"),
    ("investment", 0.03, "Investment", "Investissement", "الاستثمار"),
    ("transportation", 0.02, "Transportation", "Transport", "النقل"),
    ("water", 0.01, "Water & Sanitation", "Eau et Assainissement", "المياه والصرف الصحي"),
    ("agriculture", 0.01, "Agriculture", "Agriculture", "الزراعة"),
    ("tourism", 0.00, "Tourism", "Tourisme", "السياحة"),
]


async def seed() -> None:
    async with async_session_factory() as session:
        repo = PISConfigRepository(session)
        for dim, weight, en, fr, ar in DIMENSIONS:
            existing = await repo.get_by_dimension(dim)
            if not existing:
                await repo.create(
                    dimension=dim, weight=weight,
                    label_en=en, label_fr=fr, label_ar=ar,
                )
                print(f"Created: {dim} = {weight}")
            else:
                print(f"Exists:  {dim} = {existing.weight}")
        await session.commit()
    print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
