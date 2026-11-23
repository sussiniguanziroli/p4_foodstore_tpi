import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

const enlace = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-orange-100 text-orange-800' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  }`

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  // Selector: el componente solo se vuelve a dibujar cuando cambia la cantidad de unidades
  const unidades = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0))
  const navigate = useNavigate()

  async function cerrarSesion() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-3 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-600 text-lg text-white">🍕</span>
          <span className="text-lg font-extrabold tracking-tight text-stone-900">Food Store</span>
        </Link>

        <NavLink to="/" end className={enlace}>
          Catálogo
        </NavLink>
        {usuario && (
          <NavLink to="/mis-pedidos" className={enlace}>
            Mis pedidos
          </NavLink>
        )}
        {/* Ocultar el enlace es comodidad: la protección real está en ProtectedRoute y en require_role */}
        {usuario?.role === 'admin' && (
          <NavLink to="/admin" className={enlace}>
            Panel admin
          </NavLink>
        )}

        <div className="ml-auto flex items-center gap-2">
          <NavLink to="/carrito" className={enlace} aria-label={`Carrito, ${unidades} unidades`}>
            🛒 Carrito
            {unidades > 0 && (
              <span className="ml-1.5 rounded-full bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">{unidades}</span>
            )}
          </NavLink>

          {usuario ? (
            <>
              <span className="hidden text-right text-sm leading-tight sm:block">
                <span className="block font-semibold text-stone-800">{usuario.full_name}</span>
                <span className="text-xs text-stone-500">
                  @{usuario.username} · {usuario.role === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
              </span>
              <button
                type="button"
                onClick={cerrarSesion}
                className="rounded-lg bg-stone-800 px-3 py-2 text-sm font-medium text-white hover:bg-stone-900"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={enlace}>
                Ingresar
              </NavLink>
              <Link to="/register" className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
