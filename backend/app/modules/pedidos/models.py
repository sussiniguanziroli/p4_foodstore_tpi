from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.database import ahora

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


class Pedido(SQLModel, table=True):
    """Un pedido no se borra nunca: se cancela (estado CANCELADO)."""

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    # PENDIENTE | EN_PREPARACION | ENTREGADO | CANCELADO (la máquina de estados vive en el Service)
    estado: str = Field(default="PENDIENTE", max_length=20, index=True)
    # EFECTIVO | TRANSFERENCIA (RN-06, validado en el schema)
    forma_pago: str = Field(max_length=20)
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None, max_length=500)
    # Suma de los subtotales de las líneas; fijo desde la creación (RN-05)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))  # type: ignore[call-overload]
    updated_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))  # type: ignore[call-overload]

    # Usuario 1:N Pedido
    usuario: "Usuario" = Relationship(back_populates="pedidos")
    # Pedido 1:N DetallePedido (composición: las líneas pertenecen al pedido)
    items: list["DetallePedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={"order_by": "DetallePedido.id"},
    )


class DetallePedido(SQLModel, table=True):
    """Línea inmutable del pedido (RN-05): copia el nombre y el precio del producto al crearse.

    Si después el producto cambia de precio o de nombre, el pedido sigue mostrando los valores
    con los que se vendió.
    """

    __tablename__ = "detalle_pedido"  # type: ignore[assignment]

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    # subtotal = precio_unitario × cantidad
    subtotal: float

    pedido: Pedido = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")
