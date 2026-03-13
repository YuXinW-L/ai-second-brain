from __future__ import annotations

import chromadb
from chromadb.api.models.Collection import Collection

from app.core.settings import settings


_client: chromadb.Client | None = None
_collection: Collection | None = None


def get_client() -> chromadb.Client:
    global _client
    if _client is None:
        _client = chromadb.Client()
    return _client


def get_collection() -> Collection:
    global _collection
    if _collection is None:
        client = get_client()
        # 明确指定不使用默认的嵌入函数
        _collection = client.get_or_create_collection(
            name=settings.chroma_collection,
            embedding_function=None  # 不使用默认的嵌入函数
        )
    return _collection