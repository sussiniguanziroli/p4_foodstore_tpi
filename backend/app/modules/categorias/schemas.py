from typing import Annotated

from pydantic import StringConstraints
from sqlmodel import SQLModel

NombreCategoria = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
Descripcion = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)]


class CategoriaCreate(SQLModel):
    nombre: NombreCategoria
    descripcion: Descripcion | None = None


class CategoriaUpdate(SQLModel):
    """PUT con actualización parcial: solo cambia los campos enviados."""

    nombre: NombreCategoria | None = None
    descripcion: Descripcion | None = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
