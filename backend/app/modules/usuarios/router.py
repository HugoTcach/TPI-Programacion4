from fastapi import APIRouter, Depends
from typing import List
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
from app.core.deps import require_role, get_current_active_user
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])

def get_usuario_service():
    return UsuarioService(UsuarioUnitOfWork())

@router.get("", response_model=List[UserPublic])
def list_usuarios(
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    return service.get_all()

@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(
    id: int,
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    return service.activar(id)

@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    id: int,
    service: UsuarioService = Depends(get_usuario_service),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    return service.desactivar(id, current_user.id)
