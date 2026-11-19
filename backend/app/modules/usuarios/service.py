from fastapi import HTTPException
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.models import Usuario
from app.core.security import get_password_hash

class UsuarioNoEncontrado(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail="Usuario no encontrado")

class UsuarioDuplicado(HTTPException):
    def __init__(self, detail: str = "Usuario duplicado"):
        super().__init__(status_code=409, detail=detail)

class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def get_all(self):
        with self.uow as uow:
            usuarios = uow.usuarios.get_all()
            return [UserPublic.model_validate(u) for u in usuarios]

    def activar(self, id: int):
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(id)
            if not usuario:
                raise UsuarioNoEncontrado()
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, id: int, current_admin_id: int):
        if id == current_admin_id:
            raise HTTPException(status_code=400, detail="El administrador no puede desactivarse a sí mismo")
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(id)
            if not usuario:
                raise UsuarioNoEncontrado()
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
