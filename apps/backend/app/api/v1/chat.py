from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.db.session import get_session
from app.domain.schemas import ChatRequest, ChatResponse, JournalEntryOut
from app.services.chat_service import ChatService

router = APIRouter()


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, session: Session = Depends(get_session)) -> ChatResponse:
    svc = ChatService(session)
    try:
        reply, used = svc.reply(messages=[m.model_dump() for m in payload.messages], use_memories=payload.use_memories, top_k=payload.top_k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return ChatResponse(
        reply=reply,
        used_memories=[JournalEntryOut(**u) for u in used],
    )

