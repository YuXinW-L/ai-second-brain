from __future__ import annotations

import logging
from datetime import datetime
from typing import List, Dict, Any
from uuid import UUID

from sqlmodel import Session

from app.db.session import engine
from app.domain.models import ConversationHistory, ConversationSession, utc_now

log = logging.getLogger(__name__)


class ConversationService:
    def __init__(self, session: Session | None = None):
        self.session = session or Session(engine)

    def create_session(self, title: str = "") -> ConversationSession:
        """创建新会话"""
        try:
            session = ConversationSession(title=title)
            self.session.add(session)
            self.session.commit()
            self.session.refresh(session)
            log.info(f"创建新会话: {session.id} - {title}")
            return session
        except Exception as e:
            log.exception(f"创建会话失败: {str(e)}")
            self.session.rollback()
            raise

    def get_all_sessions(self) -> List[Dict[str, Any]]:
        """获取所有会话"""
        try:
            sessions = self.session.query(ConversationSession).order_by(
                ConversationSession.updated_at.desc()
            ).all()
            
            return [
                {
                    "id": str(session.id),
                    "title": session.title,
                    "updated_at": session.updated_at
                }
                for session in sessions
            ]
        except Exception as e:
            log.exception(f"获取会话列表失败: {str(e)}")
            raise

    def get_session(self, session_id: UUID) -> ConversationSession:
        """获取单个会话"""
        try:
            session = self.session.query(ConversationSession).filter(
                ConversationSession.id == session_id
            ).first()
            if not session:
                raise ValueError(f"会话不存在: {session_id}")
            return session
        except Exception as e:
            log.exception(f"获取会话失败: {str(e)}")
            raise

    def update_session(self, session_id: UUID, title: str) -> ConversationSession:
        """更新会话信息"""
        try:
            session = self.get_session(session_id)
            session.title = title
            session.updated_at = utc_now()
            self.session.commit()
            self.session.refresh(session)
            log.info(f"更新会话: {session_id} - {title}")
            return session
        except Exception as e:
            log.exception(f"更新会话失败: {str(e)}")
            self.session.rollback()
            raise

    def add_message(self, conversation_id: UUID, role: str, content: str) -> ConversationHistory:
        """添加一条对话消息"""
        try:
            message = ConversationHistory(
                conversation_id=conversation_id,
                role=role,
                content=content
            )
            self.session.add(message)
            
            # 更新会话的updated_at时间
            session = self.get_session(conversation_id)
            session.updated_at = utc_now()
            
            self.session.commit()
            self.session.refresh(message)
            log.info(f"添加对话消息: {role} - {content[:50]}...")
            return message
        except Exception as e:
            log.exception(f"添加对话消息失败: {str(e)}")
            self.session.rollback()
            raise

    def get_history(self, conversation_id: UUID, limit: int = 50) -> List[Dict[str, str]]:
        """获取对话历史"""
        try:
            messages = self.session.query(ConversationHistory).filter(
                ConversationHistory.conversation_id == conversation_id
            ).order_by(
                ConversationHistory.timestamp.asc()
            ).limit(limit).all()
            
            return [
                {
                    "role": msg.role,
                    "content": msg.content
                }
                for msg in messages
            ]
        except Exception as e:
            log.exception(f"获取对话历史失败: {str(e)}")
            raise

    def clear_history(self, conversation_id: UUID) -> None:
        """清空对话历史"""
        try:
            self.session.query(ConversationHistory).filter(
                ConversationHistory.conversation_id == conversation_id
            ).delete()
            self.session.commit()
            log.info(f"清空对话历史: {conversation_id}")
        except Exception as e:
            log.exception(f"清空对话历史失败: {str(e)}")
            self.session.rollback()
            raise
