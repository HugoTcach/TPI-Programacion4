from fastapi import HTTPException
from typing import Optional
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.productos.schemas import ProductoCreate, ProductoUpdate, ProductoStockUpdate, ProductoRead, ProductosPaginados
from app.modules.productos.models import Producto

class ProductoNoEncontrado(HTTPException):
    def __init__(self, detail="Producto no encontrado"):
        super().__init__(status_code=404, detail=detail)

class CategoriaInvalida(HTTPException):
    def __init__(self, detail="Categoría no existe o inactiva"):
        super().__init__(status_code=404, detail=detail)

class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def get_paginados(self, skip: int, limit: int, search: Optional[str], categoria_id: Optional[int], disponible: Optional[bool]):
        with self.uow as uow:
            total, items = uow.productos.get_paginados(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def get_by_id(self, id: int):
        with self.uow as uow:
            producto = uow.productos.get_by_id(id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado()
            return ProductoRead.model_validate(producto)

    def create(self, producto_in: ProductoCreate):
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(producto_in.categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaInvalida()
                
            db_producto = Producto(
                nombre=producto_in.nombre,
                descripcion=producto_in.descripcion,
                precio_base=producto_in.precio_base,
                imagen_url=producto_in.imagen_url,
                stock=producto_in.stock,
                disponible=producto_in.disponible,
                categoria_id=producto_in.categoria_id,
                activo=True
            )
            uow.productos.add(db_producto)
            uow.session.commit()
            uow.session.refresh(db_producto)
            return ProductoRead.model_validate(db_producto)

    def update(self, id: int, producto_in: ProductoUpdate):
        with self.uow as uow:
            db_producto = uow.productos.get_by_id(id)
            if not db_producto or not db_producto.activo:
                raise ProductoNoEncontrado()
                
            if producto_in.categoria_id != db_producto.categoria_id:
                categoria = uow.categorias.get_by_id(producto_in.categoria_id)
                if not categoria or not categoria.activo:
                    raise CategoriaInvalida()
                    
            for field, value in producto_in.model_dump(exclude_unset=True).items():
                setattr(db_producto, field, value)
                
            uow.productos.add(db_producto)
            uow.session.commit()
            uow.session.refresh(db_producto)
            return ProductoRead.model_validate(db_producto)
            
    def update_stock(self, id: int, stock_in: ProductoStockUpdate):
        with self.uow as uow:
            db_producto = uow.productos.get_by_id(id)
            if not db_producto or not db_producto.activo:
                raise ProductoNoEncontrado()
                
            db_producto.stock = stock_in.stock
            db_producto.disponible = stock_in.disponible
            uow.productos.add(db_producto)
            uow.session.commit()
            uow.session.refresh(db_producto)
            return ProductoRead.model_validate(db_producto)

    def delete(self, id: int):
        with self.uow as uow:
            db_producto = uow.productos.get_by_id(id)
            if not db_producto or not db_producto.activo:
                raise ProductoNoEncontrado()
            db_producto.activo = False
            uow.productos.add(db_producto)
