from __future__ import annotations

import logging
from typing import Any

import requests

from app.core.settings import settings

log = logging.getLogger(__name__)


class OllamaClient:
    def __init__(self, base_url: str | None = None):
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")

    def embed(self, text: str, *, model: str | None = None) -> list[float]:
        model_name = model or settings.ollama_embed_model
        url = f"{self.base_url}/api/embeddings"
        resp = requests.post(url, json={"model": model_name, "prompt": text}, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        emb = data.get("embedding")
        if not isinstance(emb, list):
            raise RuntimeError("ollama_invalid_embedding_response")
        return [float(x) for x in emb]

    def chat(self, messages: list[dict[str, Any]], *, model: str | None = None) -> str:
        model_name = model or settings.ollama_chat_model
        url = f"{self.base_url}/api/chat"
        resp = requests.post(url, json={"model": model_name, "messages": messages, "stream": False}, timeout=300)
        resp.raise_for_status()
        data = resp.json()
        msg = (data.get("message") or {}).get("content")
        if not isinstance(msg, str):
            raise RuntimeError("ollama_invalid_chat_response")
        return msg

