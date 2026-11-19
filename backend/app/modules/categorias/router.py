from fastapi import APIRouter, Depends, status
from typing import List
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.modules.categorias.service import CategoriaService
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["categorias"])

def get_categoria_service():
    return CategoriaService(CategoriaUnitOfWork())

@router.get("", response_model=List[CategoriaRead])
def get_categorias(service: CategoriaService = Depends(get_categoria_service)):
    return service.get_activas()

@router.get("/{id}", response_model=CategoriaRead)
def get_categoria(id: int, service: CategoriaService = Depends(get_categoria_service)):
    return service.get_by_id(id)

@router.post("", response_model=CategoriaRead, status_code=201)
def create_categoria(
    categoria_in: CategoriaCreate,
    service: CategoriaService = Depends(get_categoria_service),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    return service.create(categoria_in)

@router.put("/{id}", response_model=CategoriaRead)
def update_categoria(
    id: int,
    categoria_in: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    return service.update(id, categoria_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_categoria(
    id: int,
    service: CategoriaService = Depends(get_categoria_service),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    service.delete(id)
