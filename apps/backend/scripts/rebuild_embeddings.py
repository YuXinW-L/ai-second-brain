#!/usr/bin/env python3
"""
批量重建日记的embedding脚本
用于为所有现有日记生成embedding并写入向量数据库
"""

import logging
from sqlmodel import Session

from app.db.session import engine
from app.domain.models import JournalEntry
from app.services.embedding_service import EmbeddingService

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def rebuild_embeddings():
    """重建所有日记的embedding"""
    logger.info("开始重建embedding...")
    
    embedding_service = EmbeddingService()
    
    with Session(engine) as session:
        # 获取所有未删除的日记
        entries = session.query(JournalEntry).filter(
            JournalEntry.deleted_at.is_(None)
        ).all()
        
        logger.info(f"找到 {len(entries)} 篇日记需要重建embedding")
        
        for i, entry in enumerate(entries, 1):
            try:
                logger.info(f"处理第 {i}/{len(entries)} 篇日记: {entry.title or '无标题'}")
                embedding_service.embed_and_upsert_entry(entry)
                logger.info(f"成功为日记 {entry.id} 生成embedding")
            except Exception as e:
                logger.error(f"处理日记 {entry.id} 时出错: {str(e)}")
    
    logger.info("embedding重建完成！")

if __name__ == "__main__":
    rebuild_embeddings()
