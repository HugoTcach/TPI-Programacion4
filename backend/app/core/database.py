from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {})

def create_all_tables():
    SQLModel.metadata.create_all(engine)

def session_factory():
    return Session(engine, expire_on_commit=False)
