import axios, { isAxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'

/**
 * Cliente HTTP único de la aplicación.
 * - baseURL sale de VITE_API_URL (ya incluye /api/v1).
 * - withCredentials: el navegador envía y recibe la cookie HttpOnly access_token aunque el
 *   frontend (:5173) y la API (:8000) tengan orígenes distintos. El frontend nunca lee el token.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
})

// /auth/token y /auth/me manejan su propio 401 (credenciales incorrectas / sin sesión al arrancar)
const RUTAS_PROPIAS = ['/auth/token', '/auth/me']
const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

/**
 * Interceptor de respuesta: si la sesión dejó de ser válida, limpia el authStore.
 * - 401 fuera de /auth/token y /auth/me: cookie ausente, token vencido o inválido.
 * - 400 con detail «Cuenta de usuario desactivada»: el admin desactivó la cuenta.
 * La vuelta a /login la hace ProtectedRoute al quedar sin usuario.
 */
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      const url = error.config?.url ?? ''
      const status = error.response?.status
      const detail: unknown = error.response?.data?.detail
      const esRutaPropia = RUTAS_PROPIAS.some((ruta) => url.includes(ruta))

      if ((status === 401 && !esRutaPropia) || (status === 400 && detail === CUENTA_DESACTIVADA)) {
        useAuthStore.getState().limpiarSesion()
      }
    }
    return Promise.reject(error)
  },
)
