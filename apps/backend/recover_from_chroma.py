import chromadb
from datetime import datetime
from uuid import UUID
from app.core.settings import settings
from app.db.session import engine, init_db
from app.domain.models import JournalEntry, json_dumps, utc_now
from sqlmodel import Session, select

# 初始化数据库
init_db()

# 连接到向量数据库
client = chromadb.PersistentClient(path=str(settings.chroma_path))

# 获取collection
collection = client.get_or_create_collection(name=settings.chroma_collection)

# 获取所有向量
results = collection.get()
print(f"从向量数据库中获取到 {len(results['ids'])} 条日志")

# 恢复日志到SQLite
recovered = 0
with Session(engine) as session:
    for id_str, document, metadata in zip(results['ids'], results['documents'], results['metadatas']):
        try:
            # 将字符串ID转换为UUID
            id = UUID(id_str)
        except:
            print(f"无效的UUID: {id_str}，跳过")
            continue
        
        # 检查是否已经存在
        stmt = select(JournalEntry).where(JournalEntry.id == id)
        existing = session.exec(stmt).first()
        if existing:
            print(f"日志 {id} 已经存在，跳过")
            continue
        
        # 创建新的日志条目
        timestamp_str = metadata.get('timestamp', datetime.now().isoformat())
        try:
            timestamp = datetime.fromisoformat(timestamp_str)
        except:
            timestamp = datetime.now()
        
        title = metadata.get('title', '')
        content_md = document
        tags_str = metadata.get('tags', '')
        tags = [tag.strip() for tag in tags_str.split(',')] if tags_str else []
        
        entry = JournalEntry(
            id=id,
            timestamp=timestamp,
            title=title,
            content_md=content_md,
            tags_json=json_dumps(tags),
            created_at=utc_now(),
            updated_at=utc_now(),
            deleted_at=None
        )
        
        session.add(entry)
        recovered += 1
        print(f"恢复日志: {title} ({timestamp})")
    
    session.commit()

print(f"共恢复 {recovered} 条日志")
