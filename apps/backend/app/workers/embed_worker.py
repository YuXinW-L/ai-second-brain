from __future__ import annotations

import logging
from uuid import UUID

from sqlmodel import Session

from app.db.session import engine
from app.domain.models import JournalEntry
from app.services.embedding_service import EmbeddingService

log = logging.getLogger(__name__)


def embed_entry_id(entry_id: UUID) -> None:
    try:
        log.info("Starting embedding for entry_id=%s", entry_id)
        with Session(engine) as session:
            entry = session.get(JournalEntry, entry_id)
            if entry is None or entry.deleted_at is not None:
                log.info("Entry not found or deleted, skipping embedding for entry_id=%s", entry_id)
                return
            try:
                log.info("Creating EmbeddingService for entry_id=%s", entry_id)
                EmbeddingService().embed_and_upsert_entry(entry)
                log.info("Embedding completed successfully for entry_id=%s", entry_id)
            except Exception as e:
                log.exception("Embedding failed for entry_id=%s: %s", entry_id, str(e))
    except Exception as e:
        log.exception("Unexpected error in embed_entry_id for entry_id=%s: %s", entry_id, str(e))


def delete_entry_vector(entry_id: UUID) -> None:
    try:
        EmbeddingService().delete_entry_vector(entry_id=str(entry_id))
    except Exception:
        log.exception("Vector delete failed for entry_id=%s", entry_id)

