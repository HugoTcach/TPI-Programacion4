from fastapi import HTTPException, status
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.models import Usuario
from app.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def register(self, user_in: UserCreate):
        with self.uow as uow:
            if uow.usuarios.get_by_username(user_in.username):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username ya existe")
            if uow.usuarios.get_by_email(user_in.email):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email ya existe")
            
            db_user = Usuario(
                username=user_in.username,
                full_name=user_in.full_name,
                email=user_in.email,
                hashed_password=get_password_hash(user_in.password),
                role="user"
            )
            uow.usuarios.add(db_user)
            uow.session.commit()
            uow.session.refresh(db_user)
            return UserPublic.model_validate(db_user)

    def authenticate_user(self, username: str, password: str):
        with self.uow as uow:
            user = uow.usuarios.get_by_username(username)
            if not user:
                return None
            if not verify_password(password, user.hashed_password):
                return None
            return user
