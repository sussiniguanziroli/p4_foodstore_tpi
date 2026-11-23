from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    """Unit of Work de usuarios (lo usan los módulos auth y usuarios y la dependencia de sesión)."""

    usuarios: UsuarioRepository

    def _crear_repositorios(self) -> None:
        self.usuarios = UsuarioRepository(self.session)
