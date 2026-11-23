from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService

router = APIRouter(prefix="/productos", tags=["productos"])

SoloAdmin = [Depends(require_role(["admin"]))]


def get_producto_service() -> ProductoService:
    return ProductoService()


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]

_CODIGOS: dict[type[Exception], int] = {
    ProductoNoEncontrado: status.HTTP_404_NOT_FOUND,
    CategoriaNoEncontrada: status.HTTP_404_NOT_FOUND,
}


def _a_http(exc: Exception) -> HTTPException:
    return HTTPException(status_code=_CODIGOS[type(exc)], detail=str(exc))


@router.get("", response_model=ProductosPaginados, summary="Listar productos activos (paginado, búsqueda y filtros)")
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0, description="Cantidad de registros a saltear")] = 0,
    limit: Annotated[int, Query(ge=1, le=100, description="Tamaño de la página (máximo 100)")] = 20,
    search: Annotated[str | None, Query(max_length=100, description="Texto a buscar en el nombre")] = None,
    categoria_id: Annotated[int | None, Query(ge=1)] = None,
    disponible: bool | None = None,
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get(
    "/{producto_id}",
    response_model=ProductoRead,
    summary="Detalle de un producto con su categoría",
    responses={404: {"description": "Producto inexistente o dado de baja"}},
)
def obtener_producto(producto_id: int, service: ServiceDep):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as exc:
        raise _a_http(exc)


@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=SoloAdmin,
    summary="Crear un producto (admin)",
    responses={404: {"description": "La categoría no existe o está dada de baja"}},
)
def crear_producto(datos: ProductoCreate, service: ServiceDep):
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada as exc:
        raise _a_http(exc)


@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    dependencies=SoloAdmin,
    summary="Actualizar un producto (admin, parcial)",
    responses={404: {"description": "Producto inexistente, o nueva categoría inexistente o dada de baja"}},
)
def actualizar_producto(producto_id: int, datos: ProductoUpdate, service: ServiceDep):
    try:
        return service.actualizar(producto_id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise _a_http(exc)


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    dependencies=SoloAdmin,
    summary="Actualizar stock y disponibilidad (admin)",
    responses={404: {"description": "Producto inexistente"}},
)
def actualizar_stock(producto_id: int, datos: ProductoStockUpdate, service: ServiceDep):
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado as exc:
        raise _a_http(exc)


@router.delete(
    "/{producto_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    dependencies=SoloAdmin,
    summary="Dar de baja un producto (baja lógica, admin)",
    responses={404: {"description": "Producto inexistente"}},
)
def eliminar_producto(producto_id: int, service: ServiceDep):
    try:
        service.dar_de_baja(producto_id)
    except ProductoNoEncontrado as exc:
        raise _a_http(exc)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
