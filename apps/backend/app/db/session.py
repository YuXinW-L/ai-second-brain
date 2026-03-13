from __future__ import annotations

from collections.abc import Generator

from sqlmodel import Session, SQLModel, create_engine

from app.core.settings import settings


def _sqlite_url() -> str:
    # Windows paths need forward slashes in sqlite URLs
    return f"sqlite:///{settings.sqlite_path.as_posix()}"


engine = create_engine(
    _sqlite_url(),
    echo=False,
    connect_args={"check_same_thread": False},
)


def init_db() -> None:
    settings.sqlite_path.parent.mkdir(parents=True, exist_ok=True)
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

