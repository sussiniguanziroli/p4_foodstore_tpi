import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Rol } from '@/features/usuarios'
import { useAuthStore } from '@/store/authStore'

interface Props {
  /** Sin roles alcanza con tener sesión. */
  rolesPermitidos?: Rol[]
}

/**
 * Guardián de rutas. Organiza la navegación; la protección real está en el backend
 * (get_current_user → 401 y require_role → 403): ocultar un botón no reemplaza a require_role.
 */
export function ProtectedRoute({ rolesPermitidos }: Props) {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const location = useLocation()

  // 1. checkSession todavía no respondió: indicador, sin redirigir ni mostrar la pantalla.
  //    (El usuario guardado por persist sirve para pintar la Navbar, pero la sesión la confirma /auth/me.)
  if (cargando) {
    return (
      <p role="status" className="py-16 text-center text-stone-500">
        Verificando sesión…
      </p>
    )
  }

  // 2. Sin sesión: al login, recordando la pantalla pedida para volver después
  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  // 3. Con sesión pero sin el rol: a /unauthorized
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
