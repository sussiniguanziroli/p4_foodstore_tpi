from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import AdminUser, require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import AutoDesactivacion, UsuarioNoEncontrado, UsuarioService

# Todas las rutas de este router exigen rol admin
router = APIRouter(
    prefix="/admin/usuarios",
    tags=["usuarios (admin)"],
    dependencies=[Depends(require_role(["admin"]))],
)


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]

_CODIGOS: dict[type[Exception], int] = {
    UsuarioNoEncontrado: status.HTTP_404_NOT_FOUND,
    AutoDesactivacion: status.HTTP_400_BAD_REQUEST,
}


def _a_http(exc: Exception) -> HTTPException:
    return HTTPException(status_code=_CODIGOS[type(exc)], detail=str(exc))


@router.get("", response_model=list[UserPublic], summary="Listar usuarios (incluye los desactivados)")
def listar_usuarios(service: ServiceDep):
    return service.listar()


@router.post(
    "/{usuario_id}/activar",
    response_model=UserPublic,
    summary="Activar un usuario (alta lógica)",
    responses={404: {"description": "Usuario inexistente"}},
)
def activar_usuario(usuario_id: int, service: ServiceDep):
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as exc:
        raise _a_http(exc)


@router.post(
    "/{usuario_id}/desactivar",
    response_model=UserPublic,
    summary="Desactivar un usuario (baja lógica)",
    responses={
        400: {"description": "El admin intenta desactivarse a sí mismo"},
        404: {"description": "Usuario inexistente"},
    },
)
def desactivar_usuario(usuario_id: int, admin: AdminUser, service: ServiceDep):
    try:
        return service.desactivar(usuario_id, admin.id)
    except (UsuarioNoEncontrado, AutoDesactivacion) as exc:
        raise _a_http(exc)
