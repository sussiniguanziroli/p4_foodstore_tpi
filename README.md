# Food Store · Sistema de pedidos de comida

**Trabajo Práctico Integrador · Programación IV · TUPaD UTN**
**Autor:** Patricio Sussini Guanziroli

| | |
|---|---|
| 🔗 **Repositorio** | https://github.com/USUARIO/REPOSITORIO <!-- REEMPLAZAR por la URL pública del repositorio --> |
| 🎥 **Video de demostración** | https://LINK-DEL-VIDEO <!-- REEMPLAZAR por el link público (YouTube, Drive, etc.) --> |

Aplicación web completa para un negocio de comidas. Los clientes se registran, recorren el catálogo, arman un
carrito y confirman pedidos con dirección de entrega y forma de pago (efectivo o transferencia). El administrador
gestiona categorías, productos, stock, pedidos y usuarios desde un panel, y ve un resumen del negocio.

- **Backend:** API REST con FastAPI + SQLModel + PostgreSQL, arquitectura en capas
  (Router → Service → Unit of Work → Repository → Model), JWT en cookie HttpOnly y autorización por roles.
- **Frontend:** React + TypeScript (`strict`) + Vite + Tailwind CSS 4, organizado por features, con Axios,
  TanStack Query, TanStack Form, TanStack Table, React Router y Zustand.

---

## Índice

1. [Requisitos](#1-requisitos)
2. [Estructura del repositorio](#2-estructura-del-repositorio)
3. [Backend: instalación y ejecución](#3-backend-instalación-y-ejecución)
4. [Frontend: instalación y ejecución](#4-frontend-instalación-y-ejecución)
5. [Uso diario: levantar el sistema paso a paso](#5-uso-diario-levantar-el-sistema-paso-a-paso)
6. [Variables de entorno](#6-variables-de-entorno)
7. [Usuario administrador y datos del seed](#7-usuario-administrador-y-datos-del-seed)
8. [Funcionalidades](#8-funcionalidades)
9. [API REST](#9-api-rest)
10. [Reglas de negocio](#10-reglas-de-negocio)
11. [Arquitectura](#11-arquitectura)
12. [Solución de problemas](#12-solución-de-problemas)

---

## 1. Requisitos

| Herramienta | Versión | Verificar con |
|---|---|---|
| Python | 3.11, 3.12 o 3.13 (no 3.14) | `python --version` |
| PostgreSQL | 15 o superior | `psql --version` (o pgAdmin) |
| Node.js | 20.19 o superior | `node --version` |
| pnpm | 9 o superior | `pnpm --version` |

Si no tenés pnpm: `npm install -g pnpm` (o `corepack enable pnpm`).

Probado con Python 3.11 y 3.13, PostgreSQL 16, Node 22 y pnpm 10.

## 2. Estructura del repositorio

```
.
├── README.md                     ← este archivo (el único README del proyecto)
├── backend/
│   ├── .env.example              ← plantilla de variables (copiar como .env)
│   ├── requirements.txt          ← dependencias con versiones fijadas
│   └── app/
│       ├── main.py               ← FastAPI, CORS con credenciales y routers bajo /api/v1
│       ├── core/                 ← config, database, security, deps, unit_of_work, base_repository
│       ├── db/seed.py            ← carga admin, categorías y productos (idempotente)
│       └── modules/
│           ├── auth/             ← router, service, schemas (registro, login, logout, /me)
│           ├── usuarios/         ← models, schemas, repository, unit_of_work, service, router
│           ├── categorias/       ← misma cadena de archivos
│           ├── productos/        ← misma cadena de archivos
│           └── pedidos/          ← misma cadena de archivos (dominio central)
└── frontend/
    ├── .env.example              ← VITE_API_URL
    ├── package.json · pnpm-lock.yaml · vite.config.ts · tsconfig*.json
    └── src/
        ├── shared/               ← api/ (Axios, errores, QueryClient), ui/, components/, layout/
        ├── features/             ← auth/, categorias/, productos/, usuarios/, pedidos/
        │                           (cada una con pages/, components/, hooks/, api/, types/)
        ├── store/                ← authStore.ts y cartStore.ts (Zustand + persist)
        ├── routes/               ← AppRouter.tsx y ProtectedRoute.tsx
        ├── App.tsx · main.tsx · index.css
```

## 3. Backend: instalación y ejecución

Los comandos están escritos para **Windows (PowerShell)**. En macOS/Linux se indica la alternativa.

**3.1. Crear la base de datos** (una sola vez). Con pgAdmin: clic derecho en *Databases* → *Create* →
*Database…* → nombre `foodstore_db`. O por consola:

```bash
createdb -U postgres foodstore_db
```

**3.2. Entorno virtual y dependencias**

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate              # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

> Si tenés varias versiones de Python, elegí una compatible: `py -3.13 -m venv .venv`.
> Si PowerShell no deja ejecutar `activate`: `Set-ExecutionPolicy -Scope Process Bypass` y repetir.

**3.3. Variables de entorno**

```powershell
Copy-Item .env.example .env         # cmd: copy .env.example .env · macOS/Linux: cp .env.example .env
```

Abrir `backend/.env` y completar al menos `DATABASE_URL` (usuario y clave de tu PostgreSQL) y `SECRET_KEY`
(32 caracteres o más). Ver [Variables de entorno](#6-variables-de-entorno).

**3.4. Cargar los datos iniciales** (se puede repetir: no duplica nada)

```powershell
python -m app.db.seed
```

**3.5. Levantar la API**

```powershell
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación interactiva (Swagger): http://localhost:8000/docs
- Documentación de referencia (ReDoc): http://localhost:8000/redoc

Al iniciar, la API crea las tablas que falten. Para probar endpoints protegidos desde `/docs`, iniciar sesión con
`POST /api/v1/auth/token`: la cookie queda guardada en el navegador y se envía sola en las siguientes pruebas.

## 4. Frontend: instalación y ejecución

Con el backend corriendo, en **otra terminal**:

```powershell
cd frontend
Copy-Item .env.example .env         # cmd: copy .env.example .env · macOS/Linux: cp .env.example .env
pnpm install
pnpm build                          # verifica los tipos (tsc) y genera dist/
pnpm dev
```

Abrir **http://localhost:5173** (usar `localhost`, no `127.0.0.1`: ver [Solución de problemas](#12-solución-de-problemas)).

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo con recarga en caliente |
| `pnpm build` | Chequeo de tipos con `tsc -b` (TypeScript `strict`) y build de producción |
| `pnpm preview` | Sirve el resultado de `build` |
| `pnpm lint` | Linter (oxlint) |

## 5. Uso diario: levantar el sistema paso a paso

Esta guía es para **cuando ya hiciste una vez la instalación** (secciones 3 y 4). El sistema son dos programas que
tienen que estar corriendo **al mismo tiempo**, cada uno en su propia ventana de terminal: el **backend** (la API, en el
puerto 8000) y el **frontend** (la página web, en el puerto 5173). PostgreSQL tiene que estar encendido (en Windows
arranca solo con la PC; si no, abrir pgAdmin o *Servicios → postgresql → Iniciar*).

### Antes de empezar: los archivos `.env`

Cada programa lee su configuración de un archivo `.env` en su propia carpeta. Por eso hay dos:

| Archivo | Para qué | Qué tiene |
|---|---|---|
| `backend/.env` | Que la API se conecte a PostgreSQL y firme los logins | `DATABASE_URL` (usuario, **clave** y base) y `SECRET_KEY` |
| `frontend/.env` | Que la página sepa dónde está la API | `VITE_API_URL=http://localhost:8000/api/v1` |

Los `.env.example` son **plantillas**: se copian como `.env` y se completan una sola vez (paso 3.3 y 4). Los `.env` tienen
datos privados y **no** se suben al repositorio.

### Paso 1 · Terminal 1: levantar el backend

Abrir **PowerShell** y escribir, una línea por vez:

```powershell
cd "RUTA\DEL\PROYECTO\backend"
.venv\Scripts\activate
uvicorn app.main:app --reload
```

- `cd` entra a la carpeta del backend (reemplazar `RUTA\DEL\PROYECTO` por la carpeta donde está el proyecto; un atajo es
  escribir `cd ` y arrastrar la carpeta `backend` desde el Explorador a la terminal).
- `activate` enciende el entorno virtual de Python: al principio de la línea tiene que aparecer **`(.venv)`**.
- `uvicorn` levanta la API. Está lista cuando aparece **`Application startup complete.`**
- **No cerrar esta ventana** mientras se use el sistema.

Comprobación: abrir http://localhost:8000/docs → se ve la documentación de la API.

> Si la base está vacía (catálogo sin productos), detener con `Ctrl + C`, correr `python -m app.db.seed` y volver a
> ejecutar `uvicorn app.main:app --reload`. El seed se puede correr las veces que haga falta: no duplica datos.

### Paso 2 · Terminal 2: levantar el frontend

Abrir **otra** ventana de PowerShell (dejar la primera abierta) y escribir:

```powershell
cd "RUTA\DEL\PROYECTO\frontend"
pnpm dev
```

Está lista cuando aparece **`Local: http://localhost:5173/`**. **No cerrar esta ventana** tampoco.

### Paso 3 · Usar el sistema

Abrir **http://localhost:5173** en el navegador (con `localhost`, no con `127.0.0.1`).

| Para probar como… | Cómo |
|---|---|
| Administrador | **Ingresar** con `admin` / `Admin1234!` → menú **Panel admin** |
| Cliente | **Crear cuenta** con un usuario nuevo → catálogo → carrito → confirmar pedido → **Mis pedidos** |

### Paso 4 · Apagar

En cada terminal presionar **`Ctrl + C`** y después cerrar la ventana.

### Volver a empezar con la base limpia (opcional)

Útil antes de grabar el video o para repetir una prueba desde cero:

1. Apagar el backend (`Ctrl + C`).
2. En pgAdmin: clic derecho en `foodstore_db` → **Delete** (confirmar) y crearla de nuevo (**Databases → Create → Database…** → `foodstore_db`).
3. En la terminal del backend (con `(.venv)` activo): `python -m app.db.seed` y luego `uvicorn app.main:app --reload`.
4. En el navegador, cerrar sesión (el carrito guardado se vacía desde la pantalla del carrito).

## 6. Variables de entorno

### `backend/.env`

| Variable | Obligatoria | Descripción | Valor de ejemplo |
|---|---|---|---|
| `DATABASE_URL` | Sí | Conexión a la base | `postgresql://postgres:TU_CLAVE@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Sí | Firma de los JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | No | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Duración del token y de la cookie | `30` |
| `FRONTEND_ORIGIN` | No | Origen permitido por CORS (varios: separados por coma) | `http://localhost:5173` |
| `COOKIE_SECURE` | No | `true` solo en producción con HTTPS | `false` |

- Para generar una `SECRET_KEY`: `python -c "import secrets; print(secrets.token_hex(32))"`.
- Para desarrollo sin PostgreSQL también funciona `DATABASE_URL=sqlite:///./foodstore.db`.
- Si falta `DATABASE_URL` o `SECRET_KEY` (o la clave tiene menos de 32 caracteres), la API no arranca y lo informa.

### `frontend/.env`

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API, con el prefijo `/api/v1` | `http://localhost:8000/api/v1` |

## 7. Usuario administrador y datos del seed

`python -m app.db.seed` crea, solo si no existen:

| Dato | Detalle |
|---|---|
| **Usuario administrador** | usuario **`admin`** · contraseña **`Admin1234!`** · rol `admin` |
| Categorías (5) | Pizzas, Hamburguesas, Empanadas, Bebidas, Postres |
| Productos (10) | 2 por categoría, todos con stock (entre 8 y 60 unidades) |

Los clientes se crean desde la pantalla **Crear cuenta** (rol `user`).

## 8. Funcionalidades

**Cliente**
- Registro e inicio de sesión (formularios con TanStack Form y validación).
- Catálogo paginado en el servidor, con búsqueda por nombre, filtro por categoría, skeleton de carga y estado vacío.
- Carrito persistido en el navegador (sobrevive a la recarga), con cantidades, subtotales y total.
- Checkout con dirección de entrega, forma de pago y notas; al confirmar se vacía el carrito.
- «Mis pedidos»: listado, detalle y cancelación mientras el pedido está `PENDIENTE` (el stock vuelve al catálogo).

**Administrador** (menú «Panel admin»)
- Resumen: pedidos de hoy, ingresos de los pedidos entregados y cantidad por estado.
- Pedidos: tabla con filtro por estado y botones para avanzar o cancelar según la máquina de estados.
- Productos y categorías: ABM con TanStack Table y TanStack Form, cambio de stock y disponibilidad, baja lógica.
- Usuarios: listado con activar y desactivar (un admin no puede desactivarse a sí mismo).

## 9. API REST

Prefijo `/api/v1`. Acceso: **Público**, **Sesión** (cualquier usuario logueado), **Dueño** o **admin**.
Códigos comunes a todos los endpoints con sesión: `401` sin cookie o token inválido/vencido, `400` «Cuenta de
usuario desactivada», `403` rol no permitido y `422` datos inválidos. Todo error responde `{"detail": ...}`.

| Método | Endpoint | Acceso | Respuesta | Errores propios |
|---|---|---|---|---|
| POST | `/auth/register` | Público | 201 `UserPublic` | 409 username o email repetido |
| POST | `/auth/token` | Público | 200 `{"message": "Login exitoso"}` + cookie | 401 credenciales · 400 cuenta desactivada |
| POST | `/auth/logout` | Público | 200 (borra la cookie) | — |
| GET | `/auth/me` | Sesión | 200 `UserPublic` | — |
| GET | `/admin/usuarios` | admin | 200 `list[UserPublic]` | — |
| POST | `/admin/usuarios/{id}/activar` | admin | 200 `UserPublic` | 404 |
| POST | `/admin/usuarios/{id}/desactivar` | admin | 200 `UserPublic` | 404 · 400 auto-desactivación |
| GET | `/categorias` | Público | 200 `list[CategoriaRead]` | — |
| GET | `/categorias/{id}` | Público | 200 `CategoriaRead` | 404 |
| POST | `/categorias` | admin | 201 `CategoriaRead` | 409 nombre repetido |
| PUT | `/categorias/{id}` | admin | 200 `CategoriaRead` | 404 · 409 |
| DELETE | `/categorias/{id}` | admin | 204 (baja lógica) | 404 |
| GET | `/productos` | Público | 200 `ProductosPaginados` | — |
| GET | `/productos/{id}` | Público | 200 `ProductoRead` | 404 |
| POST | `/productos` | admin | 201 `ProductoRead` | 404 categoría inexistente o dada de baja |
| PUT | `/productos/{id}` | admin | 200 `ProductoRead` | 404 producto o nueva categoría |
| PATCH | `/productos/{id}/stock` | admin | 200 `ProductoRead` | 404 |
| DELETE | `/productos/{id}` | admin | 204 (baja lógica) | 404 |
| POST | `/pedidos` | Sesión | 201 `PedidoRead` | 404 producto · 400 stock, no disponible o repetido |
| GET | `/pedidos` | Sesión | 200 `PedidosPaginados` (propios o todos si es admin) | — |
| GET | `/pedidos/resumen` | admin | 200 `ResumenPedidos` | — |
| GET | `/pedidos/{id}` | Dueño o admin | 200 `PedidoRead` | 404 · 403 pedido ajeno |
| PATCH | `/pedidos/{id}/estado` | admin | 200 `PedidoRead` | 404 · 400 transición inválida |
| PATCH | `/pedidos/{id}/cancelar` | Dueño | 200 `PedidoRead` | 404 · 403 ajeno · 400 no está PENDIENTE |

**Listados paginados:** `skip` (default 0) y `limit` (default 20, máximo 100); responden `{"total": N, "items": [...]}`.
`GET /productos` acepta además `search` (en el nombre, sin distinguir mayúsculas), `categoria_id` y `disponible`;
`GET /pedidos` acepta `estado`. Los listados públicos devuelven solo registros activos y un registro dado de baja
se trata como inexistente (404). `PUT` actualiza solo los campos enviados.

## 10. Reglas de negocio

| Regla | Descripción |
|---|---|
| **RN-01** Crear pedido | Al menos un ítem y sin productos repetidos. Cada producto debe existir, estar activo y disponible, y tener stock. Por cada ítem se verifica el stock, se descuenta y se crea la línea copiando nombre y precio. Se calcula el total y el pedido nace `PENDIENTE`. Todo en **una sola transacción**: si algo falla, no se guarda nada. |
| **RN-02** Transiciones | `PENDIENTE → EN_PREPARACION / CANCELADO`, `EN_PREPARACION → ENTREGADO / CANCELADO`. `ENTREGADO` y `CANCELADO` son terminales. Una transición inválida responde 400. |
| **RN-03** Cancelar | Restituye el stock de cada línea en la misma transacción que cambia el estado. |
| **RN-04** Permisos | El cliente solo ve y cancela sus pedidos, y solo en `PENDIENTE`. El admin ve todos y puede avanzar o cancelar cualquiera no terminal. |
| **RN-05** Inmutabilidad | Las líneas y el total no cambian después de crear el pedido. No hay endpoints para editar ni borrar pedidos. |
| **RN-06** Datos del pedido | `forma_pago` es `EFECTIVO` o `TRANSFERENCIA`; `direccion_entrega` tiene entre 5 y 200 caracteres. |

Además: las bajas son **lógicas** (`activo = false` en categorías y productos, `disabled = true` en usuarios). La baja
de una categoría no libera su nombre ni oculta sus productos. El registro público siempre crea usuarios `user`.

## 11. Arquitectura

**Backend.** Cada módulo de dominio repite la cadena Router → Service → Unit of Work → Repository → Model, con
dependencias en un solo sentido:

| Capa | Responsabilidad |
|---|---|
| Router | HTTP: valida el cuerpo con schemas, resuelve sesión y rol con `Depends`, delega en el Service y traduce las excepciones de dominio a `HTTPException`. |
| Service | Reglas de negocio. Abre `with self.uow as uow:` y devuelve el schema de salida dentro del bloque. |
| Unit of Work | Crea la sesión, expone los repositorios que la comparten y hace `commit` o `rollback` en `__exit__` (único lugar con `commit`). |
| Repository | Consultas con `select`; hereda de `BaseRepository[T]`. Sin reglas de negocio. |
| Model / Schemas | Tablas SQLModel (`table=True`) y modelos de entrada/salida (nunca se expone un modelo de tabla). |

La sesión viaja en la cookie HttpOnly `access_token` (30 minutos). `get_current_user` lee la cookie y valida el JWT
(401), `get_current_active_user` rechaza cuentas desactivadas (400) y `require_role(["admin"])` controla el rol (403).

**Frontend.** Organizado por features (espejo de los módulos del backend). TanStack Query maneja el estado del
servidor (catálogo, pedidos, usuarios, resumen) con `useQuery`, `useMutation` e invalidación; Zustand maneja el
estado del cliente (`authStore` con la sesión y `cartStore` con el carrito, ambos con `persist`). La instancia de
Axios usa `withCredentials` y un interceptor que limpia la sesión ante un 401 o una cuenta desactivada.
`ProtectedRoute` redirige a `/login` sin sesión y a `/unauthorized` sin el rol. El frontend nunca lee ni guarda el
token.

## 12. Solución de problemas

| Síntoma | Causa y solución |
|---|---|
| `Field required` para `DATABASE_URL` o `SECRET_KEY` al iniciar | Falta `backend/.env` o la variable. Copiar `.env.example` como `.env` y completarlo. |
| `String should have at least 32 characters` | `SECRET_KEY` es demasiado corta. |
| `password authentication failed` | Usuario o clave de `DATABASE_URL` incorrectos. |
| `database "foodstore_db" does not exist` | Falta crear la base (paso 3.1). |
| `could not connect` / `connection refused` | PostgreSQL no está corriendo o usa otro puerto. |
| `SyntaxError` o errores de instalación con Python 3.14 | Usar Python 3.11 a 3.13 (paso 3.2). |
| Error de `bcrypt` / `passlib` | Reinstalar dependencias: deben quedar `passlib==1.7.4` y `bcrypt==4.0.1`. |
| El login funciona pero luego la app pide iniciar sesión de nuevo | Abrir el frontend en `http://localhost:5173`. Con `127.0.0.1` el navegador trata a la API (`localhost:8000`) como otro sitio y no envía la cookie. |
| El frontend dice «No se pudo conectar con el servidor» | El backend no está levantado o `VITE_API_URL` no coincide. Revisar `frontend/.env` y reiniciar `pnpm dev`. |
| Error de CORS en la consola del navegador | `FRONTEND_ORIGIN` del backend debe ser exactamente el origen del frontend (`http://localhost:5173`). |
| `pnpm` no se reconoce | Instalarlo con `npm install -g pnpm`. |
