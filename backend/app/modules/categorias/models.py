from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship

class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, nullable=False, min_length=2, max_length=100)
    descripcion: Optional[str] = None
    activo: bool = Field(default=True, nullable=False)
    
    productos: List["Producto"] = Relationship(back_populates="categoria")
