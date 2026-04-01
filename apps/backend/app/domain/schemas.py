from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from pydantic import BaseModel, Field, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    class Config:
        env_file = ".env"


settings = Settings()


class JournalEntryCreate(BaseModel):
    timestamp: datetime
    title: str = ""
    content: str = Field(min_length=1)
    tags: list[str] = Field(default_factory=list)

    @field_validator('timestamp')
    def validate_timestamp(cls, v):
        if v.tzinfo is None:
            # 如果没有时区信息，添加UTC时区
            return v.replace(tzinfo=timezone.utc)
        # 如果有时区信息，转换为UTC时间
        return v.astimezone(timezone.utc)


class JournalEntryUpdate(BaseModel):
    timestamp: datetime | None = None
    title: str | None = None
    content: str | None = None
    tags: list[str] | None = None

    @field_validator('timestamp')
    def validate_timestamp(cls, v):
        if v is not None:
            if v.tzinfo is None:
                # 如果没有时区信息，添加UTC时区
                return v.replace(tzinfo=timezone.utc)
            # 如果有时区信息，转换为UTC时间
            return v.astimezone(timezone.utc)
        return v


class JournalEntryOut(BaseModel):
    id: UUID
    timestamp: datetime
    title: str
    content: str
    tags: list[str]
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


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

