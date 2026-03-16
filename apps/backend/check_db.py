from app.db.session import engine
from sqlmodel import Session, select
from app.domain.models import JournalEntry

with Session(engine) as session:
    result = session.exec(select(JournalEntry).order_by(JournalEntry.timestamp.desc()))
    journals = list(result)
    print(f"Found journals: {len(journals)}")
    for journal in journals:
        print(f"- {journal.title} ({journal.timestamp})")
