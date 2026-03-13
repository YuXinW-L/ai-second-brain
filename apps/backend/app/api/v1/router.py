from fastapi import APIRouter

from app.api.v1 import chat, health, journal, reflection

router = APIRouter(prefix="/api/v1")

router.include_router(health.router, tags=["health"])
router.include_router(journal.router, prefix="/journal", tags=["journal"])
router.include_router(chat.router, prefix="/chat", tags=["chat"])
router.include_router(reflection.router, prefix="/reflection", tags=["reflection"])

