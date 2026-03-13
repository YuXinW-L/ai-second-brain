from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from sqlmodel import Session

from app.db.repositories.journal_repo import JournalRepository
from app.domain.models import json_loads
from app.llm.ollama_client import OllamaClient
from app.llm.prompts import SYSTEM_PERSONA


def _entry_to_out_dict(entry) -> dict[str, Any]:
    return {
        "id": entry.id,
        "timestamp": entry.timestamp,
        "title": entry.title,
        "content": entry.content_md,
        "tags": json_loads(entry.tags_json),
        "created_at": entry.created_at,
        "updated_at": entry.updated_at,
        "deleted_at": entry.deleted_at,
    }


class ReflectionService:
    def __init__(self, session: Session, *, ollama: OllamaClient | None = None):
        self.session = session
        self.journal_repo = JournalRepository(session)
        self.ollama = ollama or OllamaClient()

    def weekly(self, *, week_start: datetime) -> dict[str, Any]:
        if week_start.tzinfo is None:
            week_start = week_start.replace(tzinfo=timezone.utc)
        week_end = week_start + timedelta(days=7)

        entries = self.journal_repo.list_between(start_ts=week_start, end_ts=week_end, include_deleted=False)
        context = "\n\n".join(
            [
                "\n".join(
                    [
                        "=== Entry ===",
                        f"timestamp: {e.timestamp.isoformat()}",
                        f"title: {e.title}",
                        f"tags: {', '.join(json_loads(e.tags_json))}",
                        f"content:\n{e.content_md}",
                    ]
                )
                for e in entries
            ]
        ).strip()

        prompt = "\n\n".join(
            [
                SYSTEM_PERSONA.strip(),
                "Summarize the user's week based on these journal entries.",
                "Include: key themes, wins, struggles, patterns, and 2-4 concrete suggestions for next week.",
                "Be supportive and honest. Keep it under ~300-500 words unless entries are very long.",
                f"Week start: {week_start.date().isoformat()}",
                "Entries:\n" + (context or "(no entries)"),
            ]
        )

        summary = self.ollama.chat([{"role": "system", "content": prompt}, {"role": "user", "content": "Write my weekly reflection."}])

        return {
            "week_start": week_start,
            "week_end": week_end,
            "summary": summary,
            "entries": [_entry_to_out_dict(e) for e in entries],
        }

