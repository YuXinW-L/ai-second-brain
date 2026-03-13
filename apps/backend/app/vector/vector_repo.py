from __future__ import annotations

from typing import Any

from app.vector.chroma_client import get_collection


class VectorRepository:
    def __init__(self):
        self.collection = get_collection()

    def upsert_entry(
        self,
        *,
        entry_id: str,
        embedding: list[float],
        document: str,
        metadata: dict[str, Any],
    ) -> None:
        # 防御性验证逻辑
        if not isinstance(embedding, list):
            raise ValueError(f"Embedding must be a list, got {type(embedding)}")
        
        if len(embedding) == 0:
            raise ValueError("Embedding cannot be empty")
        
        if not isinstance(embedding[0], (float, int)):
            raise ValueError(f"Embedding elements must be float or int, got {type(embedding[0])}")
        
        # 确保所有元素都是float类型
        embedding = [float(x) for x in embedding]
        
        # 检查embedding长度是否合理
        if len(embedding) < 10:
            raise ValueError(f"Embedding dimension too small: {len(embedding)}")
        
        try:
            # 打印调试信息
            print(f"Upserting entry: {entry_id}")
            print(f"Embedding length: {len(embedding)}")
            print(f"Embedding first 3 elements: {embedding[:3]}")
            print(f"Metadata keys: {list(metadata.keys())}")
            
            self.collection.upsert(
                ids=[entry_id],
                embeddings=[embedding],
                documents=[document],
                metadatas=[metadata],
            )
            print(f"Upsert completed successfully for entry: {entry_id}")
        except Exception as e:
            print(f"Error during upsert: {str(e)}")
            raise

    def delete_entry(self, *, entry_id: str) -> None:
        self.collection.delete(ids=[entry_id])

    def query(self, *, embedding: list[float], top_k: int) -> dict[str, Any]:
        return self.collection.query(query_embeddings=[embedding], n_results=top_k, include=["metadatas", "documents", "distances"])

