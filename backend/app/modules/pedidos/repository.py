from datetime import datetime
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import col, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def list_by_usuario(
        self,
        usuario_id: int | None,
        estado: str | None,
        skip: int,
        limit: int,
    ) -> tuple[int, list[Pedido]]:
        """Pedidos paginados, del más nuevo al más viejo.

        usuario_id = None lista los de todos (lo usa el admin). Las líneas se traen con
        selectinload: una consulta para toda la página.
        """
        condiciones: list[Any] = []
        if usuario_id is not None:
            condiciones.append(col(Pedido.usuario_id) == usuario_id)
        if estado is not None:
            condiciones.append(col(Pedido.estado) == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*condiciones)).one()
        pagina = self.session.exec(
            select(Pedido)
            .where(*condiciones)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return total, list(pagina)

    def count_by_estado(self) -> dict[str, int]:
        """{estado: cantidad} con func.count y GROUP BY (una sola consulta)."""
        filas = self.session.exec(
            select(Pedido.estado, func.count()).group_by(col(Pedido.estado))  # type: ignore[call-overload]
        ).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        consulta = select(func.count()).select_from(Pedido).where(col(Pedido.created_at) >= desde)
        return self.session.exec(consulta).one()

    def sum_total_por_estado(self, estado: str) -> float:
        consulta = select(func.coalesce(func.sum(Pedido.total), 0)).where(col(Pedido.estado) == estado)
        return float(self.session.exec(consulta).one())


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    """Las líneas solo se insertan al crear el pedido: no hay consultas propias ni edición (RN-05)."""

    model = DetallePedido
