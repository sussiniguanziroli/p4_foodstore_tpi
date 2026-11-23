from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Crea las tablas que falten al iniciar. Los datos iniciales los carga `python -m app.db.seed`.
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="TPI Programación IV · TUPaD UTN · Patricio Sussini Guanziroli",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: el navegador envía y recibe la cookie HttpOnly del JWT.
# Con allow_credentials=True el origen no puede ser "*": se declara el del frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Todas las rutas cuelgan de /api/v1. Documentación en /docs (Swagger) y /redoc.
api_v1 = APIRouter(prefix="/api/v1")
api_v1.include_router(auth_router)
api_v1.include_router(usuarios_router)
api_v1.include_router(categorias_router)
api_v1.include_router(productos_router)
api_v1.include_router(pedidos_router)
app.include_router(api_v1)


@app.get("/", include_in_schema=False)
def raiz() -> dict[str, str]:
    return {"message": "Food Store API", "docs": "/docs", "redoc": "/redoc"}
