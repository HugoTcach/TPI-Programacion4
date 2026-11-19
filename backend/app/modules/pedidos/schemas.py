from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class ItemPedidoCreate(BaseModel):
    producto_id: int
    cantidad: int = Field(ge=1)

class PedidoCreate(BaseModel):
    items: List[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: str
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: Optional[str] = None

class DetallePedidoRead(BaseModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float
    model_config = ConfigDict(from_attributes=True)

class PedidoRead(BaseModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str] = None
    total: float
    created_at: datetime
    updated_at: datetime
    items: List[DetallePedidoRead]
    model_config = ConfigDict(from_attributes=True)

class PedidosPaginados(BaseModel):
    total: int
    items: List[PedidoRead]

class CambioEstado(BaseModel):
    estado: str

class ResumenPedidos(BaseModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
