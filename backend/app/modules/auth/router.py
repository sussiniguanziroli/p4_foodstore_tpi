from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import COOKIE_NAME, settings
from app.core.deps import ActiveUser
from app.modules.auth.schemas import MensajeRead
from app.modules.auth.service import AuthService, CredencialesInvalidas, CuentaDesactivada, UsuarioDuplicado
from app.modules.usuarios.schemas import UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService()


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un usuario (rol user)",
    responses={409: {"description": "El username o el email ya existen"}},
)
def registrar(datos: UserCreate, service: ServiceDep):
    try:
        return service.registrar(datos)
    except UsuarioDuplicado as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))


@router.post(
    "/token",
    response_model=MensajeRead,
    summary="Login con formulario OAuth2: guarda el JWT en la cookie HttpOnly",
    responses={
        401: {"description": "Credenciales incorrectas"},
        400: {"description": "Cuenta de usuario desactivada"},
    },
)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: ServiceDep,
):
    try:
        token = service.autenticar(form.username, form.password)
    except CredencialesInvalidas as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except CuentaDesactivada as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # la cookie vence junto con el token
        httponly=True,  # JavaScript no puede leerla: protege el token ante XSS
        samesite="lax",  # mitiga CSRF
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    return MensajeRead(message="Login exitoso")


@router.post("/logout", response_model=MensajeRead, summary="Cerrar sesión: borra la cookie")
def logout(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/",
    )
    return MensajeRead(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic, summary="Usuario de la sesión actual")
def me(usuario: ActiveUser):
    return usuario
