from datetime import datetime
from enum import StrEnum
from typing import Annotated

from pydantic import StringConstraints
from sqlmodel import Field, SQLModel


class EstadoPedido(StrEnum):
    PENDIENTE = "PENDIENTE"
    EN_PREPARACION = "EN_PREPARACION"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"


class FormaPago(StrEnum):
    EFECTIVO = "EFECTIVO"
    TRANSFERENCIA = "TRANSFERENCIA"


Direccion = Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=200)]
Notas = Annotated[str, StringConstraints(strip_whitespace=True, max_length=500)]


# --- Entrada ----------------------------------------------------------------------


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    """RN-06: forma_pago solo EFECTIVO o TRANSFERENCIA y dirección de 5 a 200 caracteres (si no, 422).

    El cliente NO envía precios ni total: los calcula el servidor con los datos de la base.
    """

    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago
    direccion_entrega: Direccion
    notas: Notas | None = None


class CambioEstado(SQLModel):
    estado: EstadoPedido


# --- Salida -----------------------------------------------------------------------


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
