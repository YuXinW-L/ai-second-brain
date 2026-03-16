from fastapi import APIRouter

from app.api.v1 import ai, journal

api_router = APIRouter()

api_router.include_router(journal.router, prefix="/journal", tags=["journal"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
