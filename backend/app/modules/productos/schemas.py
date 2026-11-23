from typing import Annotated

from pydantic import StringConstraints, model_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead

NombreProducto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=150)]
Descripcion = Annotated[str, StringConstraints(strip_whitespace=True, max_length=1000)]
ImagenUrl = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)]


class ProductoCreate(SQLModel):
    nombre: NombreProducto
    descripcion: Descripcion | None = None
    precio_base: float = Field(ge=0, le=99_999_999)
    imagen_url: ImagenUrl | None = None
    stock: int = Field(default=0, ge=0, le=1_000_000)
    disponible: bool = True
    categoria_id: int


class ProductoUpdate(SQLModel):
    """PUT con actualización parcial: solo cambia los campos enviados."""

    nombre: NombreProducto | None = None
    descripcion: Descripcion | None = None
    precio_base: float | None = Field(default=None, ge=0, le=99_999_999)
    imagen_url: ImagenUrl | None = None
    stock: int | None = Field(default=None, ge=0, le=1_000_000)
    disponible: bool | None = None
    categoria_id: int | None = None


class ProductoStockUpdate(SQLModel):
    """PATCH /productos/{id}/stock: cambia el stock, la disponibilidad o ambos."""

    stock: int | None = Field(default=None, ge=0, le=1_000_000)
    disponible: bool | None = None

    @model_validator(mode="after")
    def _al_menos_un_campo(self) -> "ProductoStockUpdate":
        if self.stock is None and self.disponible is None:
            raise ValueError("Enviá stock, disponible o ambos")
        return self


class ProductoRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria_id: int
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
