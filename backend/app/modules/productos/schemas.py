from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from app.modules.categorias.schemas import CategoriaRead

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio_base: float = Field(ge=0)
    imagen_url: Optional[str] = None
    stock: int = Field(ge=0, default=0)
    disponible: bool = True
    categoria_id: int

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(ProductoBase):
    pass

class ProductoStockUpdate(BaseModel):
    stock: int = Field(ge=0)
    disponible: bool

class ProductoRead(ProductoBase):
    id: int
    activo: bool
    categoria: Optional[CategoriaRead] = None
    model_config = ConfigDict(from_attributes=True)

class ProductosPaginados(BaseModel):
    total: int
    items: List[ProductoRead]
