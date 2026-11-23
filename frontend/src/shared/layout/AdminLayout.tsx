import { NavLink, Outlet } from 'react-router-dom'

const SECCIONES = [
  { ruta: '/admin/resumen', texto: 'Resumen' },
  { ruta: '/admin/pedidos', texto: 'Pedidos' },
  { ruta: '/admin/productos', texto: 'Productos' },
  { ruta: '/admin/categorias', texto: 'Categorías' },
  { ruta: '/admin/usuarios', texto: 'Usuarios' },
]

/** Pestañas del panel de administración. Las rutas hijas ya pasaron por ProtectedRoute (rol admin). */
export function AdminLayout() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-700">Panel de administración</p>
        <nav aria-label="Secciones del panel" className="mt-3 flex flex-wrap gap-1 border-b border-stone-200">
          {SECCIONES.map((s) => (
            <NavLink
              key={s.ruta}
              to={s.ruta}
              className={({ isActive }) =>
                `-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'border-orange-600 text-orange-700'
                    : 'border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-800'
                }`
              }
            >
              {s.texto}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  )
}
