from types import TracebackType

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Unit of Work base: agrupa las operaciones de un caso de uso en una sola transacción.

    Se usa como context manager dentro del Service:

        with self.uow as uow:
            ...    # trabajo con los repositorios (uow.productos, uow.pedidos, ...)
        # al salir: commit si no hubo excepción; rollback si la hubo; siempre close

    Es el ÚNICO lugar del proyecto que llama a commit() y rollback().
    """

    session: Session

    def __enter__(self) -> "UnitOfWork":
        self.session = session_factory()
        self._crear_repositorios()
        return self

    def _crear_repositorios(self) -> None:
        """Cada subclase crea acá los repositorios que comparten la misma sesión."""

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
