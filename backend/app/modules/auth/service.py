from sqlalchemy.exc import IntegrityError

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

# --- Excepciones de dominio -----------------------------------------------------


class UsuarioDuplicado(Exception):
    def __init__(self, campo: str) -> None:
        super().__init__(f"Ya existe un usuario con ese {campo}")


class CredencialesInvalidas(Exception):
    def __init__(self) -> None:
        # Mismo mensaje para usuario inexistente y contraseña incorrecta: no revela cuál falló
        super().__init__("Usuario o contraseña incorrectos")


class CuentaDesactivada(Exception):
    def __init__(self) -> None:
        super().__init__("Cuenta de usuario desactivada")


class AuthService:
    """Registro y login. El rol de un usuario registrado es siempre "user"."""

    def __init__(self, uow: UsuarioUnitOfWork | None = None) -> None:
        self.uow = uow or UsuarioUnitOfWork()

    def registrar(self, datos: UserCreate) -> UserPublic:
        try:
            with self.uow as uow:
                if uow.usuarios.get_by_username(datos.username) is not None:
                    raise UsuarioDuplicado("nombre de usuario")
                if uow.usuarios.get_by_email(datos.email) is not None:
                    raise UsuarioDuplicado("email")
                usuario = uow.usuarios.add(
                    Usuario(
                        username=datos.username,
                        full_name=datos.full_name,
                        email=datos.email,
                        hashed_password=hash_password(datos.password),
                        role="user",  # el registro público nunca crea administradores
                    )
                )
                return UserPublic.model_validate(usuario)
        except IntegrityError:
            # Dos registros simultáneos con el mismo dato: lo frena la restricción UNIQUE
            raise UsuarioDuplicado("nombre de usuario o email")

    def autenticar(self, username: str, password: str) -> str:
        """Verifica las credenciales y devuelve el JWT que el Router guarda en la cookie."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise CredencialesInvalidas()
            if usuario.disabled:
                raise CuentaDesactivada()
            return create_access_token({"sub": usuario.username, "role": usuario.role})
