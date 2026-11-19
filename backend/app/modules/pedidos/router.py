from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, CambioEstado, ResumenPedidos
from app.modules.pedidos.service import PedidoService
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.core.deps import require_role, get_current_active_user
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

def get_pedido_service():
    return PedidoService(PedidoUnitOfWork())

@router.post("", response_model=PedidoRead, status_code=201)
def create_pedido(
    pedido_in: PedidoCreate,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user)
):
    return service.crear_pedido(current_user.id, pedido_in)

@router.get("/resumen", response_model=ResumenPedidos)
def get_resumen(
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    return service.get_resumen()

@router.get("", response_model=PedidosPaginados)
def get_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: Optional[str] = None,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user)
):
    usuario_id = current_user.id if current_user.role != "admin" else None
    return service.get_paginados(skip, limit, estado, usuario_id)

@router.get("/{id}", response_model=PedidoRead)
def get_pedido(
    id: int,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user)
):
    is_admin = current_user.role == "admin"
    return service.get_by_id(id, current_user.id, is_admin)

@router.patch("/{id}/estado", response_model=PedidoRead)
def update_estado(
    id: int,
    cambio: CambioEstado,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(require_role(["admin"]))
):
    return service.cambiar_estado(id, cambio.estado)

@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    id: int,
    service: PedidoService = Depends(get_pedido_service),
    current_user: Usuario = Depends(get_current_active_user)
):
    return service.cancelar_propio(id, current_user.id)
