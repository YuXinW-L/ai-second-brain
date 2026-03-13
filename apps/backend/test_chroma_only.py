import chromadb
import uuid

print("Initializing Chroma...")

client = chromadb.Client()

collection = client.get_or_create_collection("test_collection")

print("Generating fake embedding...")

embedding = [0.1] * 768

print("Adding vector...")

collection.add(
    ids=[str(uuid.uuid4())],
    embeddings=[embedding],
    documents=["test"]
)

print("Success!")