from fastapi import HTTPException
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.modules.categorias.models import Categoria

class CategoriaNoEncontrada(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail="Categoría no encontrada")

class NombreDuplicado(HTTPException):
    def __init__(self):
        super().__init__(status_code=409, detail="Nombre duplicado")

class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def get_activas(self):
        with self.uow as uow:
            categorias = uow.categorias.get_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def get_by_id(self, id: int):
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada()
            return CategoriaRead.model_validate(categoria)

    def create(self, categoria_in: CategoriaCreate):
        with self.uow as uow:
            existente = uow.categorias.get_by_nombre(categoria_in.nombre)
            if existente:
                if existente.activo:
                    raise NombreDuplicado()
                else:
                    existente.activo = True
                    existente.descripcion = categoria_in.descripcion
                    uow.categorias.add(existente)
                    db_categoria = existente
            else:
                db_categoria = Categoria(
                    nombre=categoria_in.nombre,
                    descripcion=categoria_in.descripcion,
                    activo=True
                )
                uow.categorias.add(db_categoria)
            
            uow.session.commit()
            uow.session.refresh(db_categoria)
            return CategoriaRead.model_validate(db_categoria)

    def update(self, id: int, categoria_in: CategoriaUpdate):
        with self.uow as uow:
            db_categoria = uow.categorias.get_by_id(id)
            if not db_categoria or not db_categoria.activo:
                raise CategoriaNoEncontrada()
            
            if categoria_in.nombre != db_categoria.nombre:
                if uow.categorias.get_by_nombre(categoria_in.nombre):
                    raise NombreDuplicado()
                    
            db_categoria.nombre = categoria_in.nombre
            db_categoria.descripcion = categoria_in.descripcion
            uow.categorias.add(db_categoria)
            uow.session.commit()
            uow.session.refresh(db_categoria)
            return CategoriaRead.model_validate(db_categoria)

    def delete(self, id: int):
        with self.uow as uow:
            db_categoria = uow.categorias.get_by_id(id)
            if not db_categoria or not db_categoria.activo:
                raise CategoriaNoEncontrada()
            db_categoria.activo = False
            uow.categorias.add(db_categoria)
