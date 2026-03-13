from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlmodel import Session, col, func, select

from app.domain.models import JournalEntry


class JournalRepository:
    def __init__(self, session: Session):
        self.session = session

    def get(self, entry_id: UUID) -> JournalEntry | None:
        stmt = select(JournalEntry).where(JournalEntry.id == entry_id)
        return self.session.exec(stmt).first()

    def upsert(self, entry: JournalEntry) -> JournalEntry:
        self.session.add(entry)
        self.session.commit()
        self.session.refresh(entry)
        return entry

    def soft_delete(self, entry: JournalEntry, deleted_at: datetime) -> JournalEntry:
        entry.deleted_at = deleted_at
        entry.updated_at = deleted_at
        return self.upsert(entry)

    def search(
        self,
        *,
        q: str | None,
        tag: str | None,
        start_ts: datetime | None,
        end_ts: datetime | None,
        include_deleted: bool,
        limit: int,
        offset: int,
    ) -> tuple[int, list[JournalEntry]]:
        filters: list = []
        if not include_deleted:
            filters.append(JournalEntry.deleted_at.is_(None))
        if start_ts is not None:
            filters.append(JournalEntry.timestamp >= start_ts)
        if end_ts is not None:
            filters.append(JournalEntry.timestamp <= end_ts)
        if q:
            like = f"%{q}%"
            filters.append(col(JournalEntry.title).like(like) | col(JournalEntry.content_md).like(like))
        if tag:
            # tags_json stored as JSON array string; do a simple substring match for now.
            # (We can normalize tags later or use JSON1 when available.)
            filters.append(col(JournalEntry.tags_json).like(f"%{tag}%"))

        base = select(JournalEntry)
        if filters:
            for f in filters:
                base = base.where(f)

        count_stmt = select(func.count()).select_from(base.subquery())
        total = self.session.exec(count_stmt).one()

        items_stmt = base.order_by(JournalEntry.timestamp.desc()).offset(offset).limit(limit)
        items = list(self.session.exec(items_stmt).all())
        return int(total), items

    def list_between(
        self,
        *,
        start_ts: datetime,
        end_ts: datetime,
        include_deleted: bool = False,
    ) -> list[JournalEntry]:
        stmt = select(JournalEntry).where(JournalEntry.timestamp >= start_ts, JournalEntry.timestamp < end_ts)
        if not include_deleted:
            stmt = stmt.where(JournalEntry.deleted_at.is_(None))
        stmt = stmt.order_by(JournalEntry.timestamp.asc())
        return list(self.session.exec(stmt).all())

