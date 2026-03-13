from __future__ import annotations

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlmodel import Session

from app.db.session import get_session
from app.domain.models import json_loads
from app.domain.schemas import JournalEntryCreate, JournalEntryOut, JournalEntryUpdate, SearchResults
from app.services.journal_service import JournalService
from app.workers.embed_worker import delete_entry_vector, embed_entry_id

router = APIRouter()


def _to_out(entry) -> JournalEntryOut:
    return JournalEntryOut(
        id=entry.id,
        timestamp=entry.timestamp,
        title=entry.title,
        content=entry.content_md,
        tags=json_loads(entry.tags_json),
        created_at=entry.created_at,
        updated_at=entry.updated_at,
        deleted_at=entry.deleted_at,
    )


@router.post("", response_model=JournalEntryOut)
def create_entry(
    payload: JournalEntryCreate,
    background: BackgroundTasks,
    session: Session = Depends(get_session),
) -> JournalEntryOut:
    svc = JournalService(session)
    entry = svc.create(
        timestamp=payload.timestamp,
        title=payload.title,
        content_md=payload.content,
        tags=payload.tags,
    )
    # 恢复嵌入功能
    background.add_task(embed_entry_id, entry.id)
    return _to_out(entry)


@router.get("/{entry_id}", response_model=JournalEntryOut)
def get_entry(
    entry_id: UUID,
    include_deleted: bool = False,
    session: Session = Depends(get_session),
) -> JournalEntryOut:
    svc = JournalService(session)
    try:
        entry = svc.get(entry_id, include_deleted=include_deleted)
    except KeyError:
        raise HTTPException(status_code=404, detail="entry_not_found")
    return _to_out(entry)


@router.put("/{entry_id}", response_model=JournalEntryOut)
def update_entry(
    entry_id: UUID,
    payload: JournalEntryUpdate,
    background: BackgroundTasks,
    session: Session = Depends(get_session),
) -> JournalEntryOut:
    svc = JournalService(session)
    try:
        entry = svc.update(
            entry_id=entry_id,
            timestamp=payload.timestamp,
            title=payload.title,
            content_md=payload.content,
            tags=payload.tags,
        )
    except KeyError:
        raise HTTPException(status_code=404, detail="entry_not_found")
    except ValueError as e:
        if str(e) == "entry_deleted":
            raise HTTPException(status_code=409, detail="entry_deleted")
        raise
    background.add_task(embed_entry_id, entry.id)
    return _to_out(entry)


@router.delete("/{entry_id}", response_model=JournalEntryOut)
def delete_entry(
    entry_id: UUID,
    background: BackgroundTasks,
    session: Session = Depends(get_session),
) -> JournalEntryOut:
    svc = JournalService(session)
    try:
        entry = svc.delete(entry_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="entry_not_found")
    background.add_task(delete_entry_vector, entry.id)
    return _to_out(entry)


@router.get("", response_model=SearchResults)
def search_entries(
    q: str | None = None,
    tag: str | None = None,
    start_ts: datetime | None = None,
    end_ts: datetime | None = None,
    include_deleted: bool = False,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
) -> SearchResults:
    svc = JournalService(session)
    total, items = svc.search(
        q=q,
        tag=tag,
        start_ts=start_ts,
        end_ts=end_ts,
        include_deleted=include_deleted,
        limit=limit,
        offset=offset,
    )
    return SearchResults(total=total, items=[_to_out(e) for e in items])

