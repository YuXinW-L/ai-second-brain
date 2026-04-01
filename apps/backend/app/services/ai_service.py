from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, List, Tuple

from sqlmodel import Session

from app.db.session import engine
from app.domain.models import JournalEntry, json_loads
from app.llm.ollama_client import OllamaClient
from app.services.embedding_service import EmbeddingService
from app.services.conversation_service import ConversationService
from app.vector.vector_repo import VectorRepository

log = logging.getLogger(__name__)


class AIService:
    def __init__(self, *, ollama: OllamaClient | None = None, vectors: VectorRepository | None = None, conversation: ConversationService | None = None):
        self.ollama = ollama or OllamaClient()
        self.vectors = vectors or VectorRepository()
        self.embedding_service = EmbeddingService(ollama=ollama, vectors=vectors)
        self.conversation_service = conversation or ConversationService()

    def semantic_search(self, query: str, top_k: int = 5) -> List[dict[str, Any]]:
        """语义搜索相关日志"""
        try:
            log.info(f"Performing semantic search for query: {query}")
            # 生成查询的嵌入向量
            query_embedding = self.ollama.embed(query)
            log.info(f"Generated query embedding with dimension: {len(query_embedding)}")
            
            # 在向量数据库中查询
            results = self.vectors.query(embedding=query_embedding, top_k=top_k)
            log.info(f"Search returned {len(results.get('ids', [[]])[0])} results")
            
            # 处理结果
            formatted_results = []
            ids = results.get('ids', [[]])[0]
            documents = results.get('documents', [[]])[0]
            metadatas = results.get('metadatas', [[]])[0]
            distances = results.get('distances', [[]])[0]
            
            for i, (entry_id, document, metadata, distance) in enumerate(zip(ids, documents, metadatas, distances)):
                formatted_results.append({
                    "entry_id": entry_id,
                    "title": metadata.get("title", ""),
                    "timestamp": metadata.get("timestamp"),
                    "tags": metadata.get("tags", "").split(",") if metadata.get("tags") else [],
                    "content": document[:200] + "..." if len(document) > 200 else document,
                    "distance": distance
                })
                log.info(f"Result {i+1}: {metadata.get('title', 'No title')} (distance: {distance:.4f})")
            
            return formatted_results
        except Exception as e:
            log.exception(f"Semantic search failed: {str(e)}")
            raise

    def chat_with_ai(self, message: str, conversation_id: str = None, history: List[dict[str, str]] = None) -> Tuple[str, str]:
        """与AI对话，基于用户的日志内容"""
        try:
            from uuid import UUID
            
            # 如果没有提供conversation_id，创建新会话
            if not conversation_id:
                session = self.conversation_service.create_session(title=message[:50])
                conversation_id = str(session.id)
                log.info(f"Created new conversation: {conversation_id}")
            else:
                log.info(f"Using existing conversation: {conversation_id}")
            
            # 转换conversation_id为UUID
            conversation_uuid = UUID(conversation_id)
            
            log.info(f"Starting AI chat with message: {message[:100]}...")
            
            # 语义搜索相关日志
            search_results = self.semantic_search(message, top_k=3)
            
            # 构建上下文
            context = "# 相关日志\n"
            for i, result in enumerate(search_results):
                context += f"## 日志 {i+1}\n"
                context += f"**时间**: {result['timestamp']}\n"
                context += f"**标题**: {result['title']}\n"
                context += f"**标签**: {', '.join(result['tags'])}\n"
                context += f"**内容**: {result['content']}\n\n"
            
            log.info(f"Generated context with {len(search_results)} relevant entries")
            
            # 加载历史对话
            if not history:
                history = self.conversation_service.get_history(conversation_id=conversation_uuid, limit=10)
                log.info(f"Loaded {len(history)} history messages")
            
            # 构建消息历史
            messages = [
                {
                    "role": "system",
                    "content": "你是一个友好、有洞察力的AI助手。你会：\n" 
                    "1. 像朋友一样支持和共情\n" 
                    "2. 像导师一样具有洞察力\n" 
                    "3. 在需要时能够进行理性分析\n" 
                    "4. 基于用户的日志内容提供有意义的回答\n\n" 
                    "以下是用户的相关日志内容，请基于这些内容回答用户的问题：\n" + context
                }
            ]
            
            # 添加历史消息
            if history:
                messages.extend(history)
            
            # 添加用户当前消息
            user_message = {"role": "user", "content": message}
            messages.append(user_message)
            
            # 调用LLM
            response = self.ollama.chat(messages)
            log.info(f"Received AI response: {response[:100]}...")
            
            # 存储对话历史
            self.conversation_service.add_message(conversation_uuid, "user", message)
            self.conversation_service.add_message(conversation_uuid, "assistant", response)
            
            # 如果是新会话，更新会话标题为AI的第一句话
            if len(history) == 0:
                ai_title = response[:50]
                self.conversation_service.update_session(conversation_uuid, ai_title)
                log.info(f"Updated conversation title: {ai_title}")
            
            return response, conversation_id
        except Exception as e:
            log.exception(f"AI chat failed: {str(e)}")
            raise

    def generate_weekly_reflection(self, end_date: datetime = None) -> str:
        """生成每周总结"""
        try:
            if end_date is None:
                end_date = datetime.now(timezone.utc)
            start_date = end_date - timedelta(days=7)
            
            log.info(f"Generating weekly reflection for period: {start_date} to {end_date}")
            
            # 获取一周内的日志
            with Session(engine) as session:
                entries = session.query(JournalEntry).filter(
                    JournalEntry.timestamp >= start_date,
                    JournalEntry.timestamp <= end_date,
                    JournalEntry.deleted_at.is_(None)
                ).order_by(JournalEntry.timestamp).all()
            
            log.info(f"Found {len(entries)} entries for the week")
            
            if not entries:
                return "本周没有日志记录，无法生成总结。"
            
            # 构建周总结上下文
            context = f"# 一周日志总结 ({start_date.strftime('%Y-%m-%d')} 到 {end_date.strftime('%Y-%m-%d')})\n\n"
            
            # 按日期分组
            entries_by_date = {}
            for entry in entries:
                date_key = entry.timestamp.strftime('%Y-%m-%d')
                if date_key not in entries_by_date:
                    entries_by_date[date_key] = []
                entries_by_date[date_key].append(entry)
            
            # 构建每日总结
            for date_key, date_entries in sorted(entries_by_date.items()):
                context += f"## {date_key}\n"
                for entry in date_entries:
                    context += f"### {entry.title or '无标题'}\n"
                    context += f"**标签**: {', '.join(json_loads(entry.tags_json))}\n"
                    context += f"**内容**: {entry.content_md[:300]}...\n\n" if len(entry.content_md) > 300 else f"**内容**: {entry.content_md}\n\n"
            
            # 构建LLM提示
            messages = [
                {
                    "role": "system",
                    "content": "你是一个专业的个人成长教练。请基于用户一周的日志内容，生成一份全面的周总结，包括：\n" 
                    "1. 本周的主要活动和事件\n" 
                    "2. 情绪和心态的变化\n" 
                    "3. 成就和挑战\n" 
                    "4. 学到的教训和感悟\n" 
                    "5. 对下周的建议和目标\n\n" 
                    "总结应该友好、有洞察力，并且基于日志内容提供有意义的分析。"
                },
                {
                    "role": "user",
                    "content": context
                }
            ]
            
            # 调用LLM
            response = self.ollama.chat(messages)
            log.info(f"Generated weekly reflection")
            
            return response
        except Exception as e:
            log.exception(f"Weekly reflection generation failed: {str(e)}")
            raise
