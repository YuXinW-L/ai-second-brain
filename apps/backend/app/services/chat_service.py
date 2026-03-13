from __future__ import annotations

from typing import Any

from sqlmodel import Session

from app.domain.models import json_loads
from app.llm.ollama_client import OllamaClient
from app.llm.prompts import RAG_INSTRUCTIONS, SYSTEM_PERSONA
from app.services.retrieval_service import RetrievalService


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


class ChatService:
    def __init__(self, session: Session, *, ollama: OllamaClient | None = None):
        self.session = session
        self.ollama = ollama or OllamaClient()
        self.retrieval = RetrievalService(session, ollama=self.ollama)

    def reply(
        self,
        *,
        messages: list[dict[str, Any]],
        use_memories: bool,
        top_k: int | None,
    ) -> tuple[str, list[dict[str, Any]]]:
        last_user = next((m for m in reversed(messages) if m.get("role") == "user" and m.get("content")), None)
        if not last_user:
            raise ValueError("no_user_message")
        question = str(last_user["content"])

        used_memories: list[dict[str, Any]] = []
        context = ""
        if use_memories:
            retrieved = self.retrieval.retrieve(query=question, top_k=top_k)
            context = self.retrieval.build_context(memories=retrieved)
            used_memories = [_entry_to_out_dict(m.entry) for m in retrieved]

        system_parts = [SYSTEM_PERSONA.strip()]
        if use_memories:
            system_parts.append(RAG_INSTRUCTIONS.strip())
            system_parts.append("Retrieved memories (context):\n" + (context or "(none)"))

        system_prompt = "\n\n".join(system_parts).strip()

        chat_messages: list[dict[str, Any]] = [{"role": "system", "content": system_prompt}]
        for m in messages:
            role = m.get("role")
            if role not in ("user", "assistant"):
                continue
            content = m.get("content")
            if not content:
                continue
            chat_messages.append({"role": role, "content": str(content)})

        reply = self.ollama.chat(chat_messages)
        return reply, used_memories

