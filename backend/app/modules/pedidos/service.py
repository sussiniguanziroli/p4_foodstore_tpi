from datetime import datetime

from app.core.database import ahora
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

# --- Máquina de estados (RN-02) -----------------------------------------------------
# Para cada estado, a qué estados se puede pasar. ENTREGADO y CANCELADO son terminales.
TRANSICIONES: dict[EstadoPedido, set[EstadoPedido]] = {
    EstadoPedido.PENDIENTE: {EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO},
    EstadoPedido.EN_PREPARACION: {EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO},
    EstadoPedido.ENTREGADO: set(),
    EstadoPedido.CANCELADO: set(),
}


# --- Excepciones de dominio (el Router las traduce a HTTP) --------------------------


class PedidoNoEncontrado(Exception):  # 404
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"Pedido {pedido_id} no encontrado")


class ProductoNoEncontrado(Exception):  # 404
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto {producto_id} no encontrado")


class PedidoAjeno(Exception):  # 403
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ReglaDeNegocio(Exception):
    """Base de las reglas que se rompen con 400."""


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, stock: int, pedido: int) -> None:
        super().__init__(f"Stock insuficiente de '{nombre}': hay {stock} y se pidieron {pedido}")


class TransicionInvalida(ReglaDeNegocio):
    def __init__(self, actual: str, nuevo: str) -> None:
        super().__init__(f"Transición inválida: un pedido {actual} no puede pasar a {nuevo}")


class CancelacionNoPermitida(ReglaDeNegocio):
    def __init__(self, actual: str) -> None:
        super().__init__(f"Solo se puede cancelar un pedido PENDIENTE (el pedido está {actual})")


class PedidoService:
    """RN-01 a RN-06. Cada método abre el Unit of Work y devuelve el schema dentro del bloque.

    No existe ningún método para editar líneas ni borrar pedidos (RN-05).
    """

    def __init__(self, uow: PedidoUnitOfWork | None = None) -> None:
        self.uow = uow or PedidoUnitOfWork()

    # --- RN-01: crear el pedido en una sola transacción ------------------------------

    def crear(self, usuario_id: int, datos: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            vistos: set[int] = set()
            for item in datos.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(item.producto_id)
                vistos.add(item.producto_id)

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado=EstadoPedido.PENDIENTE,
                    forma_pago=datos.forma_pago,
                    direccion_entrega=datos.direccion_entrega,
                    notas=datos.notas or None,
                    total=0,
                )
            )

            total = 0.0
            for item in datos.items:
                # Verificar, descontar y crear la línea en la misma iteración
                producto = uow.productos.get_para_actualizar(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,  # type: ignore[arg-type]
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        # Copia del nombre y del precio (RN-05): el pedido no cambia si cambia el producto
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)
        # Si cualquier validación lanza una excepción, el Unit of Work hace rollback:
        # no queda ni el pedido, ni las líneas, ni el descuento de stock.

    # --- Lecturas (RN-04: el cliente solo ve lo suyo) --------------------------------

    def listar(self, usuario: UserPublic, estado: EstadoPedido | None, skip: int, limit: int) -> PedidosPaginados:
        with self.uow as uow:
            dueño = None if usuario.role == "admin" else usuario.id
            total, pedidos = uow.pedidos.list_by_usuario(dueño, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    # --- RN-02 y RN-03: cambio de estado y cancelación -------------------------------

    def cambiar_estado(self, pedido_id: int, nuevo: EstadoPedido) -> PedidoRead:
        """Admin: avanza o cancela según el mapa TRANSICIONES."""
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            actual = EstadoPedido(pedido.estado)
            if nuevo not in TRANSICIONES[actual]:
                raise TransicionInvalida(actual, nuevo)
            if nuevo == EstadoPedido.CANCELADO:
                self._restituir_stock(uow, pedido)
            self._aplicar_estado(uow, pedido, nuevo)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """Dueño: cancela su propio pedido, solo desde PENDIENTE."""
        with self.uow as uow:
            pedido = self._buscar(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != EstadoPedido.PENDIENTE:
                raise CancelacionNoPermitida(pedido.estado)
            self._restituir_stock(uow, pedido)
            self._aplicar_estado(uow, pedido, EstadoPedido.CANCELADO)
            return PedidoRead.model_validate(pedido)

    # --- Resumen del panel ------------------------------------------------------------

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteo = uow.pedidos.count_by_estado()
            # "Hoy" según la hora local del servidor, desde las 00:00
            inicio_de_hoy = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=conteo.get(EstadoPedido.PENDIENTE, 0),
                en_preparacion=conteo.get(EstadoPedido.EN_PREPARACION, 0),
                entregados=conteo.get(EstadoPedido.ENTREGADO, 0),
                cancelados=conteo.get(EstadoPedido.CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_de_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_por_estado(EstadoPedido.ENTREGADO), 2),
            )

    # --- Auxiliares -------------------------------------------------------------------

    @staticmethod
    def _buscar(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve al stock la cantidad de cada línea, en la misma transacción que el
        cambio de estado. Se restituye aunque el producto se haya dado de baja después."""
        for item in pedido.items:
            producto = uow.productos.get_para_actualizar(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)

    @staticmethod
    def _aplicar_estado(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: EstadoPedido) -> None:
        pedido.estado = nuevo
        pedido.updated_at = ahora()
        uow.pedidos.add(pedido)
