from datetime import datetime, timezone

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings


def _url_con_driver(url: str) -> str:
    """Fija el driver psycopg2 cuando la URL no lo indica.

    SQLAlchemy 2.1 usa psycopg (versión 3) por defecto para "postgresql://"; el proyecto
    instala psycopg2-binary, así que la URL del enunciado (postgresql://...) se completa como
    postgresql+psycopg2://...
    """
    if url.startswith("postgresql://"):
        return "postgresql+psycopg2://" + url.removeprefix("postgresql://")
    return url


DATABASE_URL = _url_con_driver(settings.DATABASE_URL)

# SQLite (solo desarrollo) necesita permitir el uso de la conexión desde otros hilos
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Una única instancia del engine para toda la aplicación
engine = create_engine(DATABASE_URL, echo=False, connect_args=_connect_args)


def ahora() -> datetime:
    """Fecha y hora actual con zona horaria (UTC). Se usa en created_at y updated_at."""
    return datetime.now(timezone.utc)


def create_all_tables() -> None:
    """Crea las tablas que falten. Importa los modelos para que SQLModel los registre."""
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Crea una sesión nueva. La usa el Unit of Work en __enter__.

    expire_on_commit=False: después del commit los objetos conservan sus valores, así no se
    produce un DetachedInstanceError si se leen una vez cerrada la sesión.
    """
    return Session(engine, expire_on_commit=False)
