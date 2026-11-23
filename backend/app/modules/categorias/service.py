from sqlalchemy.exc import IntegrityError

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

# --- Excepciones de dominio -----------------------------------------------------


class CategoriaNoEncontrada(Exception):
    def __init__(self, categoria_id: int) -> None:
        super().__init__(f"Categoría {categoria_id} no encontrada")


class NombreDuplicado(Exception):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"Ya existe una categoría con el nombre '{nombre}'")


class CategoriaService:
    """Casos de uso de categorías. Cada método abre el Unit of Work y devuelve el schema de salida
    dentro del bloque `with`. Ningún método llama a commit(): lo hace el Unit of Work al salir."""

    def __init__(self, uow: CategoriaUnitOfWork | None = None) -> None:
        self.uow = uow or CategoriaUnitOfWork()

    @staticmethod
    def _activa(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        """Una categoría dada de baja se trata como inexistente (404)."""
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(categoria_id)
        return categoria

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, categoria_id))

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        try:
            with self.uow as uow:
                if uow.categorias.get_by_nombre(datos.nombre) is not None:
                    raise NombreDuplicado(datos.nombre)
                categoria = uow.categorias.add(Categoria.model_validate(datos))
                return CategoriaRead.model_validate(categoria)
        except IntegrityError:
            raise NombreDuplicado(datos.nombre)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        cambios = datos.model_dump(exclude_unset=True)  # solo lo que vino en el cuerpo
        try:
            with self.uow as uow:
                categoria = self._activa(uow, categoria_id)
                nuevo_nombre = cambios.get("nombre")
                if nuevo_nombre is not None:
                    otra = uow.categorias.get_by_nombre(nuevo_nombre)
                    if otra is not None and otra.id != categoria.id:
                        raise NombreDuplicado(nuevo_nombre)
                if "nombre" in cambios and nuevo_nombre is None:
                    cambios.pop("nombre")  # el nombre es obligatorio: un null no lo borra
                categoria.sqlmodel_update(cambios)
                uow.categorias.add(categoria)
                return CategoriaRead.model_validate(categoria)
        except IntegrityError:
            raise NombreDuplicado(str(cambios.get("nombre")))

    def dar_de_baja(self, categoria_id: int) -> None:
        """Baja lógica: activo = false. No libera el nombre ni da de baja sus productos."""
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)
