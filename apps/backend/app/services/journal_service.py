from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlmodel import Session

from app.db.repositories.changelog_repo import ChangeLogRepository
from app.db.repositories.journal_repo import JournalRepository
from app.domain.models import ChangeLog, JournalEntry, json_dumps, json_loads, utc_now


class JournalService:
    def __init__(self, session: Session):
        self.session = session
        self.journal_repo = JournalRepository(session)
        self.changelog_repo = ChangeLogRepository(session)

    def _write_changelog(self, *, entry: JournalEntry, op: str) -> None:
        payload = {
            "id": str(entry.id),
            "timestamp": entry.timestamp.isoformat(),
            "title": entry.title,
            "tags": json_loads(entry.tags_json),
            "updated_at": entry.updated_at.isoformat(),
            "deleted_at": entry.deleted_at.isoformat() if entry.deleted_at else None,
        }
        row = ChangeLog(
            entity_type="journal_entry",
            entity_id=str(entry.id),
            op=op,
            changed_at=utc_now(),
            payload_json=json_dumps(payload),
        )
        self.changelog_repo.append(row)

    def create(
        self,
        *,
        timestamp: datetime,
        title: str,
        content_md: str,
        tags: list[str],
    ) -> JournalEntry:
        now = utc_now()
        entry = JournalEntry(
            timestamp=timestamp,
            title=title,
            content_md=content_md,
            tags_json=json_dumps(tags),
            created_at=now,
            updated_at=now,
            deleted_at=None,
        )
        entry = self.journal_repo.upsert(entry)
        self._write_changelog(entry=entry, op="upsert")
        return entry

    def update(
        self,
        *,
        entry_id: UUID,
        timestamp: datetime | None,
        title: str | None,
        content_md: str | None,
        tags: list[str] | None,
    ) -> JournalEntry:
        entry = self.journal_repo.get(entry_id)
        if entry is None:
            raise KeyError("entry_not_found")
        if entry.deleted_at is not None:
            raise ValueError("entry_deleted")

        if timestamp is not None:
            entry.timestamp = timestamp
        if title is not None:
            entry.title = title
        if content_md is not None:
            entry.content_md = content_md
        if tags is not None:
            entry.tags_json = json_dumps(tags)

        entry.updated_at = utc_now()
        entry = self.journal_repo.upsert(entry)
        self._write_changelog(entry=entry, op="upsert")
        return entry

    def get(self, entry_id: UUID, *, include_deleted: bool = False) -> JournalEntry:
        entry = self.journal_repo.get(entry_id)
        if entry is None:
            raise KeyError("entry_not_found")
        if (not include_deleted) and entry.deleted_at is not None:
            raise KeyError("entry_not_found")
        return entry

    def delete(self, entry_id: UUID) -> JournalEntry:
        entry = self.journal_repo.get(entry_id)
        if entry is None:
            raise KeyError("entry_not_found")
        if entry.deleted_at is not None:
            return entry
        entry = self.journal_repo.soft_delete(entry, deleted_at=utc_now())
        self._write_changelog(entry=entry, op="delete")
        return entry

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
        return self.journal_repo.search(
            q=q,
            tag=tag,
            start_ts=start_ts,
            end_ts=end_ts,
            include_deleted=include_deleted,
            limit=limit,
            offset=offset,
        )

