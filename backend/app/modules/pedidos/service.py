from fastapi import HTTPException
from typing import Optional
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, CambioEstado, ResumenPedidos
from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.productos.service import ProductoNoEncontrado
from datetime import datetime, timezone

class StockInsuficiente(HTTPException):
    def __init__(self, detail="Stock insuficiente"):
        super().__init__(status_code=400, detail=detail)

class ProductoNoDisponible(HTTPException):
    def __init__(self, detail="Producto no disponible"):
        super().__init__(status_code=400, detail=detail)

class ProductoRepetido(HTTPException):
    def __init__(self, detail="Producto repetido en el pedido"):
        super().__init__(status_code=400, detail=detail)

class PedidoNoEncontrado(HTTPException):
    def __init__(self, detail="Pedido no encontrado"):
        super().__init__(status_code=404, detail=detail)

class TransicionInvalida(HTTPException):
    def __init__(self, detail="Transición de estado inválida"):
        super().__init__(status_code=400, detail=detail)

class PedidoAjeno(HTTPException):
    def __init__(self, detail="No tiene permisos para acceder a este pedido"):
        super().__init__(status_code=403, detail=detail)

TRANSICIONES_VALIDAS = {
    "PENDIENTE": ["EN_PREPARACION", "CANCELADO"],
    "EN_PREPARACION": ["ENTREGADO", "CANCELADO"],
    "ENTREGADO": [],
    "CANCELADO": []
}

class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear_pedido(self, usuario_id: int, pedido_in: PedidoCreate):
        if pedido_in.forma_pago not in ("EFECTIVO", "TRANSFERENCIA"):
            raise HTTPException(status_code=400, detail="Forma de pago inválida")
            
        productos_vistos = set()
        for item in pedido_in.items:
            if item.producto_id in productos_vistos:
                raise ProductoRepetido()
            productos_vistos.add(item.producto_id)

        with self.uow as uow:
            nuevo_pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=pedido_in.forma_pago,
                direccion_entrega=pedido_in.direccion_entrega,
                notas=pedido_in.notas,
                total=0.0
            )
            uow.pedidos.add(nuevo_pedido)
            # Flush is needed to generate the pedido ID, but we just use relationship
            
            total = 0.0
            detalles = []
            
            for item in pedido_in.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado()
                if not producto.disponible:
                    raise ProductoNoDisponible()
                if producto.stock < item.cantidad:
                    raise StockInsuficiente()
                
                producto.stock -= item.cantidad
                uow.productos.add(producto)
                
                subtotal = producto.precio_base * item.cantidad
                total += subtotal
                
                detalle = DetallePedido(
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal
                )
                detalles.append(detalle)
                
            nuevo_pedido.total = total
            nuevo_pedido.items = detalles
            uow.pedidos.add(nuevo_pedido)
            
            uow.session.commit()
            uow.session.refresh(nuevo_pedido)
            return PedidoRead.model_validate(nuevo_pedido)

    def get_paginados(self, skip: int, limit: int, estado: Optional[str], usuario_id: Optional[int]):
        with self.uow as uow:
            total, items = uow.pedidos.get_paginados(skip, limit, estado, usuario_id)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def get_by_id(self, id: int, usuario_id: int, is_admin: bool):
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(id)
            if not pedido:
                raise PedidoNoEncontrado()
            if not is_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, id: int, nuevo_estado: str):
        if nuevo_estado not in ("EN_PREPARACION", "ENTREGADO", "CANCELADO"):
            raise TransicionInvalida(detail="Estado destino no válido")
            
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(id)
            if not pedido:
                raise PedidoNoEncontrado()
                
            estado_actual = pedido.estado
            if nuevo_estado not in TRANSICIONES_VALIDAS.get(estado_actual, []):
                raise TransicionInvalida()
                
            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)
            
            if nuevo_estado == "CANCELADO":
                for detalle in pedido.items:
                    producto = uow.productos.get_by_id(detalle.producto_id)
                    if producto:
                        producto.stock += detalle.cantidad
                        uow.productos.add(producto)
                        
            uow.pedidos.add(pedido)
            uow.session.commit()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar_propio(self, id: int, usuario_id: int):
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(id)
            if not pedido:
                raise PedidoNoEncontrado()
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise HTTPException(status_code=400, detail="El pedido no está pendiente")
                
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            
            for detalle in pedido.items:
                producto = uow.productos.get_by_id(detalle.producto_id)
                if producto:
                    producto.stock += detalle.cantidad
                    uow.productos.add(producto)
                    
            uow.pedidos.add(pedido)
            uow.session.commit()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def get_resumen(self):
        with self.uow as uow:
            pendientes = uow.pedidos.count_by_estado("PENDIENTE")
            en_preparacion = uow.pedidos.count_by_estado("EN_PREPARACION")
            entregados = uow.pedidos.count_by_estado("ENTREGADO")
            cancelados = uow.pedidos.count_by_estado("CANCELADO")
            pedidos_hoy = uow.pedidos.count_pedidos_hoy()
            ingresos = uow.pedidos.sum_ingresos_entregados()
            
            return ResumenPedidos(
                pendientes=pendientes,
                en_preparacion=en_preparacion,
                entregados=entregados,
                cancelados=cancelados,
                pedidos_hoy=pedidos_hoy,
                ingresos_entregados=ingresos
            )
