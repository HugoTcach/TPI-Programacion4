from typing import Optional, List, Tuple
from sqlmodel import Session, select, func
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto

class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_paginados(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None
    ) -> Tuple[int, List[Producto]]:
        statement = select(Producto).where(Producto.activo == True)
        
        if search:
            statement = statement.where(Producto.nombre.ilike(f"%{search}%"))
        if categoria_id is not None:
            statement = statement.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            statement = statement.where(Producto.disponible == disponible)
            
        count_statement = select(func.count()).select_from(statement.subquery())
        total = self.session.exec(count_statement).one()
        
        statement = statement.offset(skip).limit(limit)
        items = list(self.session.exec(statement).all())
        
        return total, items
