import { useEffect } from 'react'
import { AppRouter } from '@/routes/AppRouter'
import { useAuthStore } from '@/store/authStore'

/** Confirma la sesión una vez al montar (GET /auth/me) y renderiza el router. */
export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession)

  // Única llamada al servidor dentro de un useEffect en todo el proyecto (la pide la consigna).
  // El resto de los datos del servidor se obtienen con TanStack Query.
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}
