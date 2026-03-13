from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Server
    host: str = "127.0.0.1"
    port: int = 8000

    # Paths (default: repo-relative)
    data_dir: Path = Path(__file__).resolve().parents[2] / "data"
    sqlite_path: Path = data_dir / "sqlite" / "second_brain.db"
    chroma_path: Path = data_dir / "chroma"

    # Ollama
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_chat_model: str = "llama3.1"
    ollama_embed_model: str = "nomic-embed-text"

    # Vector store
    chroma_collection: str = "journal_entries"

    # Retrieval defaults
    rag_top_k: int = 6
    rag_max_chars_per_entry: int = 1600


settings = Settings()

