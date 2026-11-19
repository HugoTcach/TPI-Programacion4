from typing import Optional, List, Tuple
from sqlmodel import Session, select, func
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido
from datetime import datetime, timezone, time

class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def get_paginados(self, skip: int, limit: int, estado: Optional[str] = None, usuario_id: Optional[int] = None) -> Tuple[int, List[Pedido]]:
        statement = select(Pedido)
        
        if estado:
            statement = statement.where(Pedido.estado == estado)
        if usuario_id is not None:
            statement = statement.where(Pedido.usuario_id == usuario_id)
            
        count_statement = select(func.count()).select_from(statement.subquery())
        total = self.session.exec(count_statement).one()
        
        statement = statement.order_by(Pedido.created_at.desc()).offset(skip).limit(limit)
        items = list(self.session.exec(statement).all())
        
        return total, items

    def count_by_estado(self, estado: str) -> int:
        statement = select(func.count(Pedido.id)).where(Pedido.estado == estado)
        return self.session.exec(statement).one()

    def count_pedidos_hoy(self) -> int:
        hoy = datetime.now(timezone.utc).date()
        inicio_dia = datetime.combine(hoy, time.min, tzinfo=timezone.utc)
        statement = select(func.count(Pedido.id)).where(Pedido.created_at >= inicio_dia)
        return self.session.exec(statement).one()

    def sum_ingresos_entregados(self) -> float:
        statement = select(func.sum(Pedido.total)).where(Pedido.estado == "ENTREGADO")
        resultado = self.session.exec(statement).one()
        return resultado if resultado is not None else 0.0
