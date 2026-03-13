from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class JournalEntryCreate(BaseModel):
    timestamp: datetime
    title: str = ""
    content: str = Field(min_length=1)
    tags: list[str] = Field(default_factory=list)


class JournalEntryUpdate(BaseModel):
    timestamp: datetime | None = None
    title: str | None = None
    content: str | None = None
    tags: list[str] | None = None


class JournalEntryOut(BaseModel):
    id: UUID
    timestamp: datetime
    title: str
    content: str
    tags: list[str]
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class SearchResults(BaseModel):
    total: int
    items: list[JournalEntryOut]


class ChatMessage(BaseModel):
    role: str  # system | user | assistant
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    use_memories: bool = True
    top_k: int | None = None


class ChatResponse(BaseModel):
    reply: str
    used_memories: list[JournalEntryOut] = Field(default_factory=list)


class WeeklyReflectionRequest(BaseModel):
    week_start: datetime  # date-like; client should pass ISO date at midnight


class WeeklyReflectionResponse(BaseModel):
    week_start: datetime
    week_end: datetime
    summary: str
    entries: list[JournalEntryOut]

