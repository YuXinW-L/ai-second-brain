import chromadb
from app.core.settings import settings

# 连接到向量数据库
client = chromadb.PersistentClient(path=str(settings.chroma_path))

# 获取collection
collection = client.get_or_create_collection(name=settings.chroma_collection)

# 统计向量数量
count = collection.count()
print(f"向量数据库中的向量数量: {count}")

# 获取所有向量
results = collection.get()
print(f"获取到的向量: {len(results['ids'])}")

# 打印前5个向量的元数据
for i, (id, metadata) in enumerate(zip(results['ids'], results['metadatas'])):
    if i >= 5:
        break
    print(f"ID: {id}")
    print(f"标题: {metadata.get('title', '无标题')}")
    print(f"时间: {metadata.get('timestamp', '无时间')}")
    print(f"标签: {metadata.get('tags', '无标签')}")
    print()
