import sys
import os
from pathlib import Path

# Set environment variables for tests before loading settings
os.environ["DATABASE_URL"] = "sqlite:///./test_foodstore.db"
os.environ.setdefault("SECRET_KEY", "secret-key-super-segura-de-mas-de-32-caracteres")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:5173")

sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, select

from app.main import app
from app.core.database import create_all_tables, engine
from app.core.security import get_password_hash, create_access_token
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto

@pytest.fixture(name="session", scope="function")
def session_fixture():
    SQLModel.metadata.drop_all(engine)
    create_all_tables()
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture():
    with TestClient(app) as client:
        yield client

@pytest.fixture(name="admin_token")
def admin_token_fixture(session: Session):
    admin = session.exec(select(Usuario).where(Usuario.username == "test_admin")).first()
    if not admin:
        admin = Usuario(
            username="test_admin",
            full_name="Test Admin",
            email="admin_test@foodstore.com",
            hashed_password=get_password_hash("Admin1234!"),
            role="admin",
            disabled=False
        )
        session.add(admin)
        session.commit()
        session.refresh(admin)
    return create_access_token(data={"sub": admin.username})

@pytest.fixture(name="user_token")
def user_token_fixture(session: Session):
    user = session.exec(select(Usuario).where(Usuario.username == "test_user")).first()
    if not user:
        user = Usuario(
            username="test_user",
            full_name="Test User",
            email="user_test@foodstore.com",
            hashed_password=get_password_hash("User1234!"),
            role="cliente",
            disabled=False
        )
        session.add(user)
        session.commit()
        session.refresh(user)
    return create_access_token(data={"sub": user.username})
