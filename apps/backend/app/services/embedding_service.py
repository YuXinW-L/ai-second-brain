from __future__ import annotations

import logging
from typing import Any

from app.domain.models import JournalEntry, json_loads
from app.llm.ollama_client import OllamaClient
from app.vector.vector_repo import VectorRepository

log = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self, *, ollama: OllamaClient | None = None, vectors: VectorRepository | None = None):
        self.ollama = ollama or OllamaClient()
        self.vectors = vectors or VectorRepository()

    def _entry_text(self, entry: JournalEntry) -> str:
        title = (entry.title or "").strip()
        if title:
            return f"{title}\n\n{entry.content_md}"
        return entry.content_md

    def embed_and_upsert_entry(self, entry: JournalEntry) -> None:
        text = self._entry_text(entry)
        embedding = self.ollama.embed(text)

        tags = json_loads(entry.tags_json)
        metadata: dict[str, Any] = {
            "entry_id": str(entry.id),
            "timestamp": entry.timestamp.isoformat(),
            "title": entry.title,
            "tags": ",".join(tags),  # 将tags列表转换为字符串
            "updated_at": entry.updated_at.isoformat(),
        }
        self.vectors.upsert_entry(
            entry_id=str(entry.id),
            embedding=embedding,
            document=text,
            metadata=metadata,
        )

    def delete_entry_vector(self, *, entry_id: str) -> None:
        self.vectors.delete_entry(entry_id=entry_id)

