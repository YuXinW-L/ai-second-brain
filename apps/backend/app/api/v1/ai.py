from __future__ import annotations

from datetime import datetime
from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_service import AIService
from app.services.conversation_service import ConversationService

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: str = None
    history: List[dict[str, str]] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str


class SessionResponse(BaseModel):
    id: str
    title: str
    updated_at: datetime


@router.post("/search", response_model=List[dict[str, Any]])
def semantic_search(query: str, top_k: int = 5) -> List[dict[str, Any]]:
    """语义搜索相关日志"""
    try:
        service = AIService()
        results = service.semantic_search(query, top_k=top_k)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(request: ChatRequest) -> ChatResponse:
    """与AI对话，基于用户的日志内容"""
    try:
        service = AIService()
        response, conversation_id = service.chat_with_ai(
            request.message, 
            request.conversation_id, 
            request.history
        )
        return ChatResponse(response=response, conversation_id=conversation_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"对话失败: {str(e)}")


@router.get("/weekly-reflection", response_model=dict[str, str])
def generate_weekly_reflection(end_date: datetime = None) -> dict[str, str]:
    """生成每周总结"""
    try:
        service = AIService()
        reflection = service.generate_weekly_reflection(end_date)
        return {"reflection": reflection}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成总结失败: {str(e)}")


@router.get("/conversations", response_model=List[SessionResponse])
def get_all_conversations() -> List[SessionResponse]:
    """获取所有会话"""
    try:
        service = ConversationService()
        sessions = service.get_all_sessions()
        return [SessionResponse(**session) for session in sessions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取会话列表失败: {str(e)}")


@router.get("/conversations/{conversation_id}", response_model=List[dict[str, str]])
def get_conversation_history(conversation_id: str, limit: int = 50) -> List[dict[str, str]]:
    """获取对话历史"""
    try:
        service = ConversationService()
        history = service.get_history(conversation_id=UUID(conversation_id), limit=limit)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取对话历史失败: {str(e)}")


@router.post("/conversations", response_model=SessionResponse)
def create_conversation() -> SessionResponse:
    """创建新会话"""
    try:
        service = ConversationService()
        session = service.create_session()
        return SessionResponse(
            id=str(session.id),
            title=session.title,
            updated_at=session.updated_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建会话失败: {str(e)}")
