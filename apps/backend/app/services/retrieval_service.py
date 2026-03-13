from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlmodel import Session

from app.core.settings import settings
from app.db.repositories.journal_repo import JournalRepository
from app.domain.models import JournalEntry, json_loads
from app.llm.ollama_client import OllamaClient
from app.vector.vector_repo import VectorRepository


@dataclass(frozen=True)
class RetrievedMemory:
    entry: JournalEntry
    distance: float | None


class RetrievalService:
    def __init__(
        self,
        session: Session,
        *,
        ollama: OllamaClient | None = None,
        vectors: VectorRepository | None = None,
    ):
        self.session = session
        self.journal_repo = JournalRepository(session)
        self.ollama = ollama or OllamaClient()
        self.vectors = vectors or VectorRepository()

    def retrieve(self, *, query: str, top_k: int | None = None) -> list[RetrievedMemory]:
        k = int(top_k or settings.rag_top_k)
        q_emb = self.ollama.embed(query)
        res = self.vectors.query(embedding=q_emb, top_k=k)

        ids: list[str] = (res.get("ids") or [[]])[0] or []
        distances: list[float] = (res.get("distances") or [[]])[0] or []

        memories: list[RetrievedMemory] = []
        for idx, entry_id_str in enumerate(ids):
            try:
                entry_id = UUID(entry_id_str)
            except Exception:
                continue
            entry = self.journal_repo.get(entry_id)
            if entry is None or entry.deleted_at is not None:
                continue
            dist = distances[idx] if idx < len(distances) else None
            memories.append(RetrievedMemory(entry=entry, distance=dist))
        return memories

    def build_context(self, *, memories: list[RetrievedMemory]) -> str:
        parts: list[str] = []
        for m in memories:
            e = m.entry
            tags = json_loads(e.tags_json)
            snippet = e.content_md[: settings.rag_max_chars_per_entry]
            parts.append(
                "\n".join(
                    [
                        "=== Memory ===",
                        f"timestamp: {e.timestamp.isoformat()}",
                        f"title: {e.title}",
                        f"tags: {', '.join(tags) if tags else ''}",
                        f"content_snippet:\n{snippet}",
                    ]
                )
            )
        return "\n\n".join(parts).strip()

