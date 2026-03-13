---
name: AI Second Brain (Tauri+FastAPI)
overview: "Design a modular, sync-ready local-first Second Brain app: a Tauri (React) desktop UI talks to a bundled FastAPI backend that persists journal entries in SQLite, stores embeddings in a persistent Chroma DB, and uses Ollama for local LLM chat + RAG over memories."
todos:
  - id: arch-confirmed
    content: Finalize architecture decisions (bundled backend, single-user local) and document conventions (IDs, timestamps, change log, vector metadata).
    status: completed
  - id: scaffold-structure
    content: Create the monorepo folder structure for `apps/desktop` and `apps/backend`, plus `data/` persistence dirs and README.
    status: completed
  - id: backend-journal-api
    content: Implement FastAPI journal CRUD + keyword search over SQLite (sync-ready fields, change_log writes).
    status: completed
  - id: embedding-pipeline
    content: Implement embedding generation via Ollama + persistent Chroma upsert keyed by entry_id (metadata stored).
    status: completed
  - id: rag-retrieval
    content: Implement semantic retrieval (query embed → top-k vectors → fetch entries → context assembly).
    status: completed
  - id: chat-endpoint
    content: Implement chat endpoint (personality system prompt + optional RAG context + conversation history).
    status: completed
  - id: weekly-reflection
    content: Implement weekly summarization endpoint (query entries by week → summarize via Ollama).
    status: completed
  - id: tauri-backend-spawn
    content: Implement Tauri Rust side to spawn backend process, pick a port, and expose base URL to React app.
    status: completed
isProject: false
---

## Architecture (local-first, sync-ready)

### High-level components

- **Desktop UI (Tauri + React)**
  - Journal editor (Markdown), entry list, search, tags, weekly reflection view, chat UI.
  - Calls backend over `http://127.0.0.1:<port>` (spawned locally by Tauri).
- **Local backend (Python + FastAPI)**
  - Owns all persistence + AI logic.
  - Exposes REST/JSON endpoints for journal CRUD + search, embedding jobs, retrieval, chat, weekly reflection.
- **SQLite (source of truth)**
  - Stores entries, tags, and a **sync/change log** so future mobile/desktop sync can replay changes.
- **Chroma (vector store, persistent)**
  - Stores embeddings keyed by `entry_id` with metadata (`timestamp`, `tags`, `title`, etc.).
- **Ollama (local models)**
  - **Chat model** for conversation + summarization.
  - **Embedding model** for vectorization.

### Data flow (write → embed → retrieve → answer)

```mermaid
flowchart LR
  UI[DesktopUI_TauriReact] -->|REST_JSON| API[FastAPI_Backend]
  API --> DB[(SQLite)]
  API --> VDB[(Chroma_Persistent)]
  API --> OLL[Ollama_Local]

  UI -->|CreateOrEditEntry| API
  API -->|UpsertEntry| DB
  API -->|EnqueueEmbed| API
  API -->|EmbedText| OLL
  API -->|UpsertVector(entry_id,embedding,metadata)| VDB

  UI -->|ChatQuestion| API
  API -->|EmbedQuery| OLL
  API -->|TopKSemanticSearch| VDB
  API -->|FetchEntryBodies| DB
  API -->|RAGPrompt(context+question)| OLL
  API -->|Answer| UI
```



### Key design choices to keep it modular

- **Domain layer**: plain models for `JournalEntry`, `Tag`, `ChatMessage`, `MemoryChunk`.
- **Repository layer**: `JournalRepository` (SQLite) + `VectorRepository` (Chroma) with clear interfaces.
- **Service layer**:
  - `JournalService`: CRUD, keyword search, tag management.
  - `EmbeddingService`: produces embeddings and keeps Chroma in sync with SQLite.
  - `RetrievalService`: semantic search + re-ranking (optional later).
  - `ChatService`: prompt building, personality, conversation memory, RAG assembly.
  - `ReflectionService`: weekly summaries.
- **Sync-ready boundaries** (even though sync is “later”):
  - Use **UUIDs** for `entry_id`.
  - Include `created_at`, `updated_at`, optional `deleted_at` (tombstone).
  - Maintain an **append-only change log** table (entry upserts/deletes) with a monotonic `seq` so future sync can “pull since seq”.

### Minimal database schema (initial)

- `journal_entries`: `id (uuid pk)`, `timestamp`, `title`, `content_md`, `tags_json`, `created_at`, `updated_at`, `deleted_at`
- `change_log`: `seq (int pk autoinc)`, `entity_type`, `entity_id`, `op`, `changed_at`, `payload_json`

(Chroma persists its own index; store vectors there keyed by `entry_id`.)

### AI behavior (personality)

- System prompt sets: **supportive friend + insightful mentor + analytical when needed**.
- RAG prompt injects:
  - Top-k retrieved entries (shortened/chunked), with dates/tags.
  - Instructions to cite which memories were used (by date/title) for transparency.

## Folder structure (monorepo)

```
<workspace>/
  apps/
    desktop/                 # Tauri + React
      src/
        components/
        pages/
        lib/api/             # typed API client
        lib/markdown/
      src-tauri/
        tauri.conf.json
        src/                 # Rust: spawn bundled backend, manage port

    backend/                 # FastAPI app
      app/
        main.py
        api/
          v1/
            router.py
            journal.py
            chat.py
            reflection.py
            health.py
        core/
          settings.py
          logging.py
        domain/
          models.py          # Pydantic/SQLModel domain models
          schemas.py         # request/response DTOs
        db/
          session.py         # SQLAlchemy/SQLModel engine + session
          migrations/        # optional (Alembic later)
          repositories/
            journal_repo.py
            changelog_repo.py
        vector/
          chroma_client.py
          vector_repo.py
        llm/
          ollama_client.py
          prompts.py
        services/
          journal_service.py
          embedding_service.py
          retrieval_service.py
          chat_service.py
          reflection_service.py
        workers/
          embed_worker.py     # async/background embedding jobs
        tests/
      data/
        sqlite/              # local db file
        chroma/              # chroma persistence directory

  packages/
    shared-types/            # optional: shared TS types / OpenAPI client gen

  scripts/
    dev/                     # run desktop+backend in dev

  README.md
```

### Where sync will fit later

- Add a `sync/` module in backend:
  - `GET /sync/changes?since_seq=...`
  - `POST /sync/apply` to apply remote ops
- Add a `sync_state` table to track last sync per peer.

## Concrete next steps after this plan is accepted

- Scaffold backend FastAPI project + dependencies.
- Implement `journal_entries` CRUD + keyword search + tag filtering.
- Add Chroma persistence + embedding pipeline (initially embed full entry; later chunking).
- Implement RAG retrieval + `POST /chat` endpoint using Ollama.
- Add weekly reflection summarizer endpoint.
- Add Tauri bootstrap to spawn backend and configure base URL.

