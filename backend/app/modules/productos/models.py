from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", index=True)
    nombre: str = Field(max_length=150)
    descripcion: str | None = Field(default=None, max_length=1000)
    # Restricciones >= 0: se validan en los schemas y en el Service (no hay CHECK en la base)
    precio_base: float
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0)
    # disponible: el admin lo pausa para la venta. activo: baja lógica. Son independientes.
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)

    # Categoria 1:N Producto
    categoria: "Categoria" = Relationship(back_populates="productos")
    # Producto 1:N DetallePedido (líneas de pedidos que lo referencian)
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")
