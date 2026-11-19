from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional

class UserCreate(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    password: str = Field(min_length=8)

class UserPublic(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
