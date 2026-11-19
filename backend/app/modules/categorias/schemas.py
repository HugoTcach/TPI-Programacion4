from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class CategoriaBase(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(CategoriaBase):
    pass

class CategoriaRead(CategoriaBase):
    id: int
    activo: bool
    model_config = ConfigDict(from_attributes=True)
