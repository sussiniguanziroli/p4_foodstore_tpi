from datetime import datetime
from typing import Annotated

from pydantic import EmailStr, StringConstraints, field_validator
from sqlmodel import Field, SQLModel

Username = Annotated[
    str,
    StringConstraints(strip_whitespace=True, to_lower=True, min_length=3, max_length=50, pattern=r"^[A-Za-z0-9._-]+$"),
]
NombreCompleto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


class UserCreate(SQLModel):
    """Entrada del registro público. Incluye la contraseña en texto plano (el Service la hashea)."""

    # Se guarda en minúsculas; solo letras, números, punto, guion y guion bajo
    username: Username
    full_name: NombreCompleto
    email: EmailStr
    # Mínimo 8 caracteres. Máximo 72 porque bcrypt solo procesa los primeros 72 bytes.
    password: str = Field(min_length=8, max_length=72)

    @field_validator("email")
    @classmethod
    def _email_en_minusculas(cls, valor: str) -> str:
        return valor.strip().lower()

    @field_validator("password")
    @classmethod
    def _password_hasta_72_bytes(cls, valor: str) -> str:
        if len(valor.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes")
        return valor


class UserPublic(SQLModel):
    """Lo que la API expone de un usuario: nunca incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
