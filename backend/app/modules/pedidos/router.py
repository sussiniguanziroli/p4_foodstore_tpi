from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import ActiveUser, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ReglaDeNegocio,
)

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService()


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]


def _a_http(exc: Exception) -> HTTPException:
    """Excepción de dominio → código HTTP de la especificación."""
    if isinstance(exc, (PedidoNoEncontrado, ProductoNoEncontrado)):
        codigo = status.HTTP_404_NOT_FOUND
    elif isinstance(exc, PedidoAjeno):
        codigo = status.HTTP_403_FORBIDDEN
    else:  # StockInsuficiente, ProductoNoDisponible, ProductoRepetido, TransicionInvalida, ...
        codigo = status.HTTP_400_BAD_REQUEST
    return HTTPException(status_code=codigo, detail=str(exc))


_ERRORES = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un pedido desde el carrito (RN-01)",
    responses={
        404: {"description": "Producto inexistente o inactivo"},
        400: {"description": "Stock insuficiente, producto no disponible o repetido"},
    },
)
def crear_pedido(datos: PedidoCreate, usuario: ActiveUser, service: ServiceDep):
    try:
        return service.crear(usuario.id, datos)
    except _ERRORES as exc:
        raise _a_http(exc)


@router.get("", response_model=PedidosPaginados, summary="Listar pedidos: los propios (user) o todos (admin)")
def listar_pedidos(
    usuario: ActiveUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
):
    return service.listar(usuario, estado, skip, limit)


# Se declara ANTES de /{pedido_id}: si no, "resumen" se interpretaría como un id (y daría 422)
@router.get(
    "/resumen",
    response_model=ResumenPedidos,
    dependencies=[Depends(require_role(["admin"]))],
    summary="Indicadores del panel (admin)",
)
def resumen_pedidos(service: ServiceDep):
    return service.resumen()


@router.get(
    "/{pedido_id}",
    response_model=PedidoRead,
    summary="Detalle de un pedido con sus líneas (dueño o admin)",
    responses={404: {"description": "Pedido inexistente"}, 403: {"description": "El pedido es de otro usuario"}},
)
def obtener_pedido(pedido_id: int, usuario: ActiveUser, service: ServiceDep):
    try:
        return service.obtener(pedido_id, usuario)
    except _ERRORES as exc:
        raise _a_http(exc)


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
    dependencies=[Depends(require_role(["admin"]))],
    summary="Avanzar o cancelar un pedido según la máquina de estados (admin, RN-02 y RN-03)",
    responses={404: {"description": "Pedido inexistente"}, 400: {"description": "Transición inválida"}},
)
def cambiar_estado(pedido_id: int, datos: CambioEstado, service: ServiceDep):
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except _ERRORES as exc:
        raise _a_http(exc)


@router.patch(
    "/{pedido_id}/cancelar",
    response_model=PedidoRead,
    summary="Cancelar un pedido propio en PENDIENTE (dueño, RN-03 y RN-04)",
    responses={
        404: {"description": "Pedido inexistente"},
        403: {"description": "Pedido ajeno"},
        400: {"description": "El pedido no está en PENDIENTE"},
    },
)
def cancelar_pedido(pedido_id: int, usuario: ActiveUser, service: ServiceDep):
    try:
        return service.cancelar(pedido_id, usuario)
    except _ERRORES as exc:
        raise _a_http(exc)
