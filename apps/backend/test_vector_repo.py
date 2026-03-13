from app.llm.ollama_client import OllamaClient
from app.vector.vector_repo import VectorRepository
from app.vector.chroma_client import get_collection
import uuid

# 测试流程
print("Testing VectorRepository upsert...")

# 1. 生成测试数据
entry_id = str(uuid.uuid4())
document = "这是一篇测试日记内容"
metadata = {
    "entry_id": entry_id,
    "timestamp": "2026-03-13T12:00:00",
    "title": "测试日记",
    "tags": "test",  # 将tags列表转换为字符串
    "updated_at": "2026-03-13T12:00:00"
}

# 2. 使用OllamaClient生成embedding
print("Generating embedding with Ollama...")
client = OllamaClient()
embedding = client.embed(document)
print(f"Embedding generated successfully. Length: {len(embedding)}")
print(f"First 3 elements: {embedding[:3]}")

# 3. 验证embedding格式
print("Validating embedding format...")
assert isinstance(embedding, list), f"Embedding must be a list, got {type(embedding)}"
assert len(embedding) > 0, "Embedding cannot be empty"
assert isinstance(embedding[0], (float, int)), f"Embedding elements must be float or int, got {type(embedding[0])}"
print("Embedding format is valid!")

# 4. 调用VectorRepository写入
print("Upserting to VectorRepository...")
repo = VectorRepository()
repo.upsert_entry(
    entry_id=entry_id,
    embedding=embedding,
    document=document,
    metadata=metadata
)
print("Upsert completed successfully!")

# 5. 测试查询功能
print("Testing query functionality...")

query_embedding = client.embed("测试")
results = repo.query(embedding=query_embedding, top_k=1)
print(f"Query results: {results}")
print("Test completed successfully!")
