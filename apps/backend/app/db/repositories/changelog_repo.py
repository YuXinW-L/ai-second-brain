from __future__ import annotations

from sqlmodel import Session

from app.domain.models import ChangeLog


class ChangeLogRepository:
    def __init__(self, session: Session):
        self.session = session

    def append(self, row: ChangeLog) -> ChangeLog:
        self.session.add(row)
        self.session.commit()
        self.session.refresh(row)
        return row

