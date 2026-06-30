from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pis_alert import PISAlert
from app.models.pis_config import PISConfig
from app.models.pis_recommendation import PISRecommendation
from app.models.pis_score import PISScore
from app.repositories.pis_repository import (
    PISRecommendationRepository,
    PISScoreRepository,
)

# Rule-based recommendation templates keyed by dimension
RECOMMENDATION_RULES: dict[str, list[dict]] = {
    "health": [
        {"max_score": 40, "priority": 90,
         "title": "Increase healthcare investment",
         "desc": "Healthcare score is critical. Invest in hospitals, medical equipment, and staff training to improve access and outcomes."},
        {"max_score": 60, "priority": 70,
         "title": "Strengthen primary healthcare",
         "desc": "Healthcare score is below average. Expand primary care centers and preventive medicine programs."},
        {"max_score": 75, "priority": 40,
         "title": "Enhance healthcare quality",
         "desc": "Healthcare score is moderate. Focus on specialized services and medical research partnerships."},
    ],
    "education": [
        {"max_score": 40, "priority": 90,
         "title": "Boost education funding",
         "desc": "Education score is critical. Increase school construction, teacher training, and learning materials."},
        {"max_score": 60, "priority": 70,
         "title": "Improve education access",
         "desc": "Education score is below average. Reduce dropout rates and expand secondary/vocational education."},
        {"max_score": 75, "priority": 40,
         "title": "Advance education quality",
         "desc": "Education score is moderate. Invest in digital learning and university partnerships."},
    ],
    "economy": [
        {"max_score": 40, "priority": 90,
         "title": "Revitalize local economy",
         "desc": "Economy score is critical. Launch economic stimulus, attract investment, and support local businesses."},
        {"max_score": 60, "priority": 70,
         "title": "Diversify economic base",
         "desc": "Economy score is below average. Promote entrepreneurship, improve business climate, and develop strategic sectors."},
        {"max_score": 75, "priority": 40,
         "title": "Accelerate economic growth",
         "desc": "Economy score is moderate. Focus on innovation, exports, and high-value industries."},
    ],
    "infrastructure": [
        {"max_score": 40, "priority": 90,
         "title": "Upgrade critical infrastructure",
         "desc": "Infrastructure score is critical. Prioritize roads, electricity, water, and telecommunications."},
        {"max_score": 60, "priority": 70,
         "title": "Expand infrastructure network",
         "desc": "Infrastructure score is below average. Extend coverage to underserved areas."},
        {"max_score": 75, "priority": 40,
         "title": "Modernize infrastructure",
         "desc": "Infrastructure score is moderate. Upgrade to smart infrastructure and improve maintenance."},
    ],
    "environment": [
        {"max_score": 40, "priority": 90,
         "title": "Address environmental risks",
         "desc": "Environment score is critical. Combat pollution, improve waste management, and restore ecosystems."},
        {"max_score": 60, "priority": 70,
         "title": "Strengthen environmental protection",
         "desc": "Environment score is below average. Enforce regulations and promote renewable energy."},
        {"max_score": 75, "priority": 40,
         "title": "Enhance environmental sustainability",
         "desc": "Environment score is moderate. Invest in green technology and sustainable urban planning."},
    ],
    "employment": [
        {"max_score": 40, "priority": 90,
         "title": "Create emergency employment programs",
         "desc": "Employment score is critical. Launch job creation schemes and vocational training."},
        {"max_score": 60, "priority": 70,
         "title": "Boost employment opportunities",
         "desc": "Employment score is below average. Support SMEs and develop workforce skills."},
        {"max_score": 75, "priority": 40,
         "title": "Optimize labor market",
         "desc": "Employment score is moderate. Improve job matching and promote high-skill industries."},
    ],
    "security": [
        {"max_score": 40, "priority": 90,
         "title": "Strengthen security apparatus",
         "desc": "Security score is critical. Increase police presence, surveillance, and emergency response."},
        {"max_score": 60, "priority": 70,
         "title": "Improve public safety",
         "desc": "Security score is below average. Implement community policing and crime prevention programs."},
        {"max_score": 75, "priority": 40,
         "title": "Enhance security systems",
         "desc": "Security score is moderate. Adopt smart security technologies and inter-agency coordination."},
    ],
    "investment": [
        {"max_score": 40, "priority": 90,
         "title": "Attract strategic investment",
         "desc": "Investment score is critical. Create incentives and improve infrastructure for investors."},
        {"max_score": 60, "priority": 70,
         "title": "Expand investment base",
         "desc": "Investment score is below average. Streamline regulations and promote public-private partnerships."},
        {"max_score": 75, "priority": 40,
         "title": "Optimize investment portfolio",
         "desc": "Investment score is moderate. Target high-impact sectors and improve ROI tracking."},
    ],
    "transportation": [
        {"max_score": 40, "priority": 90,
         "title": "Rebuild transportation network",
         "desc": "Transportation score is critical. Repair roads, bridges, and public transit systems."},
        {"max_score": 60, "priority": 70,
         "title": "Improve transportation access",
         "desc": "Transportation score is below average. Expand routes and reduce travel times."},
        {"max_score": 75, "priority": 40,
         "title": "Modernize transportation",
         "desc": "Transportation score is moderate. Implement intelligent transport systems."},
    ],
    "water": [
        {"max_score": 40, "priority": 90,
         "title": "Address water crisis",
         "desc": "Water score is critical. Upgrade water treatment plants and distribution networks."},
        {"max_score": 60, "priority": 70,
         "title": "Improve water management",
         "desc": "Water score is below average. Reduce losses and implement conservation programs."},
        {"max_score": 75, "priority": 40,
         "title": "Optimize water resources",
         "desc": "Water score is moderate. Invest in desalination and wastewater recycling."},
    ],
    "agriculture": [
        {"max_score": 40, "priority": 90,
         "title": "Revitalize agriculture sector",
         "desc": "Agriculture score is critical. Provide subsidies and modernize farming techniques."},
        {"max_score": 60, "priority": 70,
         "title": "Strengthen agricultural productivity",
         "desc": "Agriculture score is below average. Improve irrigation and market access."},
        {"max_score": 75, "priority": 40,
         "title": "Modernize agriculture",
         "desc": "Agriculture score is moderate. Promote agri-tech and sustainable practices."},
    ],
    "tourism": [
        {"max_score": 40, "priority": 90,
         "title": "Develop tourism sector",
         "desc": "Tourism score is critical. Build tourism infrastructure and marketing campaigns."},
        {"max_score": 60, "priority": 70,
         "title": "Expand tourism offerings",
         "desc": "Tourism score is below average. Develop attractions and hospitality training."},
        {"max_score": 75, "priority": 40,
         "title": "Enhance tourism experience",
         "desc": "Tourism score is moderate. Promote niche tourism and digital transformation."},
    ],
}


class RecommendationService:
    """Rule-based recommendation engine. No LLM used."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def generate_for_province(self, province_code: str) -> list[PISRecommendation]:
        repo = PISRecommendationRepository(self._session)
        latest = await PISScoreRepository(self._session).get_latest(province_code)
        if not latest:
            return []
        generated: list[PISRecommendation] = []
        for dim, score in latest.dimension_scores.items():
            rules = RECOMMENDATION_RULES.get(dim, [])
            for rule in rules:
                if score <= rule["max_score"]:
                    existing = await repo.list_by_province(province_code)
                    if any(
                        r.dimension == dim and not r.implemented
                        and rule["title"] in r.title
                        for r in existing
                    ):
                        continue
                    rec = await repo.create(
                        province_code=province_code,
                        dimension=dim,
                        title=rule["title"],
                        description=rule["desc"],
                        priority=rule["priority"],
                    )
                    generated.append(rec)
                    break
        return generated

    async def generate_all(self) -> list[PISRecommendation]:
        result = await self._session.execute(
            select(PISScore.province_code).distinct()
        )
        codes = [row[0] for row in result]
        all_recs: list[PISRecommendation] = []
        for code in codes:
            recs = await self.generate_for_province(code)
            all_recs.extend(recs)
        return all_recs
