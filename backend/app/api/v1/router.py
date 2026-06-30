from fastapi import APIRouter

from app.api.v1.endpoints import auth, dashboard, documents, health, indicators, organizations, pis, projects, provinces, reports, users

router = APIRouter(prefix="/api/v1")

router.include_router(health.router)
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(provinces.router)
router.include_router(organizations.router)
router.include_router(projects.router)
router.include_router(indicators.router)
router.include_router(reports.router)
router.include_router(documents.router)
router.include_router(dashboard.router)
router.include_router(pis.router)
