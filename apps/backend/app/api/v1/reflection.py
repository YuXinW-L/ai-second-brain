from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db.session import get_session
from app.domain.schemas import WeeklyReflectionRequest, WeeklyReflectionResponse
from app.services.reflection_service import ReflectionService

router = APIRouter()


@router.post("/weekly", response_model=WeeklyReflectionResponse)
def weekly_reflection(payload: WeeklyReflectionRequest, session: Session = Depends(get_session)) -> WeeklyReflectionResponse:
    svc = ReflectionService(session)
    return svc.weekly(week_start=payload.week_start)

