from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, col, select

ModelT = TypeVar("ModelT", bound=SQLModel)


class BaseRepository(Generic[ModelT]):
    """Repositorio genérico: CRUD básico de una entidad sobre la sesión del Unit of Work.

    Solo hace consultas: no tiene reglas de negocio y NUNCA llama a commit().
    Cada subclase indica su modelo (atributo `model`) y agrega sus consultas propias.
    """

    model: type[ModelT]

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_id(self, entity_id: int) -> ModelT | None:
        return self.session.get(self.model, entity_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> list[ModelT]:
        consulta = select(self.model).order_by(col(self.model.id)).offset(skip).limit(limit)  # type: ignore[attr-defined]
        return list(self.session.exec(consulta).all())

    def add(self, entity: ModelT) -> ModelT:
        # add + flush: se envía el INSERT/UPDATE y se obtiene el id, pero la transacción
        # sigue abierta hasta que el Unit of Work haga commit o rollback.
        self.session.add(entity)
        self.session.flush()
        return entity

    def delete(self, entity: ModelT) -> None:
        # Borrado físico genérico. En este proyecto no se usa: todas las bajas son lógicas.
        self.session.delete(entity)
        self.session.flush()
