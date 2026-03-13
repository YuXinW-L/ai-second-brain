from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class JournalEntry(SQLModel, table=True):
    __tablename__ = "journal_entries"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)

    # “When the entry is about”
    timestamp: datetime = Field(index=True)

    title: str = Field(default="")
    content_md: str

    # Denormalized for simplicity; can be normalized later
    tags_json: str = Field(default="[]")

    created_at: datetime = Field(index=True)
    updated_at: datetime = Field(index=True)
    deleted_at: datetime | None = Field(default=None, index=True)


class ChangeLog(SQLModel, table=True):
    __tablename__ = "change_log"

    seq: int | None = Field(default=None, primary_key=True)
    entity_type: str = Field(index=True)
    entity_id: str = Field(index=True)
    op: str = Field(index=True)  # upsert | delete
    changed_at: datetime = Field(index=True)
    payload_json: str = Field(default="{}")


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def json_dumps(obj: Any) -> str:
    import json

    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))


def json_loads(s: str) -> Any:
    import json

    return json.loads(s)

