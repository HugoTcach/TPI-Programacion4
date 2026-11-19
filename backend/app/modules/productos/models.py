from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship
from app.modules.categorias.models import Categoria

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", nullable=False)
    nombre: str = Field(nullable=False)
    descripcion: Optional[str] = None
    precio_base: float = Field(nullable=False)
    imagen_url: Optional[str] = None
    stock: int = Field(default=0, nullable=False)
    disponible: bool = Field(default=True, nullable=False)
    activo: bool = Field(default=True, nullable=False)
    
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    detalles: List["DetallePedido"] = Relationship(back_populates="producto")
