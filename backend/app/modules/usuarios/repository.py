from sqlmodel import col, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def get_by_username(self, username: str) -> Usuario | None:
        consulta = select(Usuario).where(col(Usuario.username) == username.strip().lower())
        return self.session.exec(consulta).first()

    def get_by_email(self, email: str) -> Usuario | None:
        consulta = select(Usuario).where(col(Usuario.email) == email.strip().lower())
        return self.session.exec(consulta).first()

    def list_ordenados(self) -> list[Usuario]:
        # Incluye las cuentas desactivadas: el admin las necesita para poder reactivarlas
        return list(self.session.exec(select(Usuario).order_by(col(Usuario.id))).all())
