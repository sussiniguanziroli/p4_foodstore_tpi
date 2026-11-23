from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import col, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def get_para_actualizar(self, producto_id: int) -> Producto | None:
        """Lee el producto bloqueando su fila (SELECT ... FOR UPDATE) hasta el commit.

        Lo usa el módulo pedidos al descontar o restituir stock: si dos pedidos compran el mismo
        producto a la vez, el segundo espera al primero y ve el stock ya descontado.
        """
        consulta = select(Producto).where(col(Producto.id) == producto_id).with_for_update()
        return self.session.exec(consulta).first()

    def search(
        self,
        skip: int,
        limit: int,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        """Listado paginado de productos ACTIVOS con filtros dinámicos.

        Devuelve (total que cumple los filtros, página pedida). La categoría se trae con
        selectinload: una sola consulta extra para toda la página en lugar de una por producto.
        """
        condiciones: list[Any] = [col(Producto.activo).is_(True)]
        if search:
            condiciones.append(col(Producto.nombre).ilike(f"%{search.strip()}%"))
        if categoria_id is not None:
            condiciones.append(col(Producto.categoria_id) == categoria_id)
        if disponible is not None:
            condiciones.append(col(Producto.disponible).is_(disponible))

        total = self.session.exec(select(func.count()).select_from(Producto).where(*condiciones)).one()
        pagina = self.session.exec(
            select(Producto)
            .where(*condiciones)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .order_by(col(Producto.id))
            .offset(skip)
            .limit(limit)
        ).all()
        return total, list(pagina)
