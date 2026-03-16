from fastapi import APIRouter

from app.api.v1 import ai, health, journal

router = APIRouter(prefix="/api/v1")

router.include_router(health.router, tags=["health"])
router.include_router(journal.router, prefix="/journal", tags=["journal"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])

