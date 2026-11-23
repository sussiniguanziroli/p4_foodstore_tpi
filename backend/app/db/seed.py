"""Carga los datos iniciales. Uso (desde la carpeta backend/):  python -m app.db.seed

Es idempotente: cada dato se crea solo si todavía no existe (por username o por nombre), así que
se puede ejecutar varias veces sin duplicar filas ni pisar cambios hechos desde el panel.
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.pedidos import models as _pedidos  # noqa: F401  (registra Pedido para las relaciones)
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {"username": "admin", "password": "Admin1234!", "full_name": "Administrador", "email": "admin@foodstore.com"}

CATEGORIAS = [
    ("Pizzas", "Pizzas al molde y a la piedra"),
    ("Hamburguesas", "Hamburguesas de carne y veggie con papas"),
    ("Empanadas", "Empanadas al horno, por unidad"),
    ("Bebidas", "Gaseosas, aguas y jugos"),
    ("Postres", "Postres caseros"),
]

# (categoría, nombre, descripción, precio, stock)
PRODUCTOS = [
    ("Pizzas", "Pizza muzzarella", "Salsa de tomate, muzzarella y aceitunas", 9500.0, 20),
    ("Pizzas", "Pizza napolitana", "Muzzarella, rodajas de tomate, ajo y albahaca", 11000.0, 15),
    ("Hamburguesas", "Hamburguesa clásica", "Carne, lechuga, tomate y queso, con papas", 8500.0, 25),
    ("Hamburguesas", "Hamburguesa doble cheddar", "Doble carne, doble cheddar y panceta, con papas", 11500.0, 12),
    ("Empanadas", "Empanada de carne", "Carne cortada a cuchillo", 1500.0, 60),
    ("Empanadas", "Empanada de jamón y queso", "Jamón cocido y muzzarella", 1400.0, 50),
    ("Bebidas", "Gaseosa 1,5 L", "Línea cola, lima-limón o naranja", 3200.0, 40),
    ("Bebidas", "Agua mineral 500 ml", "Con o sin gas", 1300.0, 50),
    ("Postres", "Flan casero", "Con dulce de leche", 3500.0, 10),
    ("Postres", "Tiramisú", "Porción individual", 4800.0, 8),
]


def ejecutar_seed() -> None:
    create_all_tables()
    creados = {"usuarios": 0, "categorias": 0, "productos": 0}

    with Session(engine) as session:
        # 1. Usuario administrador
        if session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first() is None:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hash_password(ADMIN["password"]),
                    role="admin",
                )
            )
            creados["usuarios"] += 1

        # 2. Categorías
        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()  # obtiene el id para usarlo en los productos
                creados["categorias"] += 1
            categorias[nombre] = categoria

        # 3. Productos con stock
        for nombre_categoria, nombre, descripcion, precio, stock in PRODUCTOS:
            if session.exec(select(Producto).where(Producto.nombre == nombre)).first() is None:
                session.add(
                    Producto(
                        categoria_id=categorias[nombre_categoria].id,  # type: ignore[arg-type]
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                    )
                )
                creados["productos"] += 1

        session.commit()

    print(
        "Seed completado. Creados: "
        f"{creados['usuarios']} usuario(s), {creados['categorias']} categoría(s), {creados['productos']} producto(s)."
    )
    print(f"Usuario administrador: {ADMIN['username']} / {ADMIN['password']}")


if __name__ == "__main__":
    ejecutar_seed()
