from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.database import ahora

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True, index=True)
    full_name: str = Field(max_length=100)
    email: str = Field(max_length=254, unique=True, index=True)
    # Nunca se guarda la contraseña: solo su hash bcrypt
    hashed_password: str = Field(max_length=255)
    # "user" (lo asigna el registro público) o "admin"
    role: str = Field(default="user", max_length=20)
    # Baja lógica: una cuenta desactivada no puede iniciar sesión ni operar
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))  # type: ignore[call-overload]

    # Usuario 1:N Pedido
    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
