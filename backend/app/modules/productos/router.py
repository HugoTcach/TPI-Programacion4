from fastapi import APIRouter, Depends, Query, status
from typing import Optional
from app.modules.productos.schemas import ProductoCreate, ProductoUpdate, ProductoStockUpdate, ProductoRead, ProductosPaginados
from app.modules.productos.service import ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["productos"])

def get_producto_service():
    return ProductoService(ProductoUnitOfWork())

@router.get("", response_model=ProductosPaginados)
def get_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    categoria_id: Optional[int] = None,
    disponible: Optional[bool] = None,
    service: ProductoService = Depends(get_producto_service)
):
    return service.get_paginados(skip, limit, search, categoria_id, disponible)

@router.get("/{id}", response_model=ProductoRead)
def get_producto(id: int, service: ProductoService = Depends(get_producto_service)):
    return service.get_by_id(id)

@router.post("", response_model=ProductoRead, status_code=201)
def create_producto(
    producto_in: ProductoCreate,
    service: ProductoService = Depends(get_producto_service),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    return service.create(producto_in)

@router.put("/{id}", response_model=ProductoRead)
def update_producto(
    id: int,
    producto_in: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    return service.update(id, producto_in)

@router.patch("/{id}/stock", response_model=ProductoRead)
def update_stock(
    id: int,
    stock_in: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    return service.update_stock(id, stock_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_producto(
    id: int,
    service: ProductoService = Depends(get_producto_service),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    service.delete(id)
