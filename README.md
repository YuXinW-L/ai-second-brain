# AI Second Brain (local-first)

Personal “Second Brain / Life Record System” desktop app.

## Architecture (current)

- **Desktop**: Tauri + React UI
- **Backend**: local **FastAPI** server (bundled/spawned by Tauri)
- **Data**: SQLite is the source of truth
- **Vector DB**: persistent Chroma (semantic memory)
- **Local AI**: Ollama (chat + embeddings)

## Conventions (sync-ready, even before sync exists)

- **IDs**: all entities use **UUIDv4** strings (e.g. `journal_entries.id`)
- **Timestamps**:
  - `timestamp`: “when the entry is about” (user-facing)
  - `created_at` / `updated_at`: system timestamps (UTC, ISO 8601)
  - `deleted_at`: nullable tombstone for soft-delete
- **Change log**:
  - SQLite includes an append-only `change_log` with monotonically increasing `seq`
  - Each create/update/delete of a syncable entity appends a row
  - Future sync can “pull changes since seq” and “apply ops”
- **Vector metadata**:
  - Each embedded entry is stored in Chroma with `id == entry_id`
  - Metadata includes: `entry_id`, `timestamp`, `title`, `tags` (string list), `updated_at`
  - If an entry is deleted, its vector is removed (or marked deleted in metadata)

## Local persistence locations (relative to repo)

- **SQLite**: `apps/backend/data/sqlite/second_brain.db`
- **Chroma**: `apps/backend/data/chroma/`

## Development notes

- This repo is scaffolded to be modular and extensible.\n+- You’ll need **Python 3.11+**. For the desktop app dev experience you’ll also need **Node.js** and the Tauri toolchain.

