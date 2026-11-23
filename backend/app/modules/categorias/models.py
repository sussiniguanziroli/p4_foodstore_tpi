from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    # Único en toda la tabla: una categoría dada de baja NO libera su nombre
    nombre: str = Field(max_length=100, unique=True, index=True)
    descripcion: str | None = Field(default=None, max_length=500)
    # Baja lógica
    activo: bool = Field(default=True)

    # Categoria 1:N Producto
    productos: list["Producto"] = Relationship(back_populates="categoria")
