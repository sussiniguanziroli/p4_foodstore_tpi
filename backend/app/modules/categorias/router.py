from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado

router = APIRouter(prefix="/categorias", tags=["categorias"])

SoloAdmin = [Depends(require_role(["admin"]))]


def get_categoria_service() -> CategoriaService:
    # Un Service (y un Unit of Work) nuevo por request. El Router nunca abre el Unit of Work.
    return CategoriaService()


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]

_CODIGOS: dict[type[Exception], int] = {
    CategoriaNoEncontrada: status.HTTP_404_NOT_FOUND,
    NombreDuplicado: status.HTTP_409_CONFLICT,
}


def _a_http(exc: Exception) -> HTTPException:
    """Traduce una excepción de dominio al código HTTP de la especificación."""
    return HTTPException(status_code=_CODIGOS[type(exc)], detail=str(exc))


@router.get("", response_model=list[CategoriaRead], summary="Listar las categorías activas")
def listar_categorias(service: ServiceDep):
    return service.listar()


@router.get(
    "/{categoria_id}",
    response_model=CategoriaRead,
    summary="Detalle de una categoría",
    responses={404: {"description": "Categoría inexistente o dada de baja"}},
)
def obtener_categoria(categoria_id: int, service: ServiceDep):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise _a_http(exc)


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=SoloAdmin,
    summary="Crear una categoría (admin)",
    responses={409: {"description": "Nombre duplicado"}},
)
def crear_categoria(datos: CategoriaCreate, service: ServiceDep):
    try:
        return service.crear(datos)
    except NombreDuplicado as exc:
        raise _a_http(exc)


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    dependencies=SoloAdmin,
    summary="Actualizar una categoría (admin, parcial)",
    responses={404: {"description": "Categoría inexistente"}, 409: {"description": "Nombre duplicado"}},
)
def actualizar_categoria(categoria_id: int, datos: CategoriaUpdate, service: ServiceDep):
    try:
        return service.actualizar(categoria_id, datos)
    except (CategoriaNoEncontrada, NombreDuplicado) as exc:
        raise _a_http(exc)


@router.delete(
    "/{categoria_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    dependencies=SoloAdmin,
    summary="Dar de baja una categoría (baja lógica, admin)",
    responses={404: {"description": "Categoría inexistente"}},
)
def eliminar_categoria(categoria_id: int, service: ServiceDep):
    try:
        service.dar_de_baja(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise _a_http(exc)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
