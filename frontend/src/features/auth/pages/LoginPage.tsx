import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { Card } from '@/shared/ui/Card'
import { useAuthStore } from '@/store/authStore'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)

  // Pantalla a la que quería ir antes de que ProtectedRoute lo mandara al login
  const desde = (location.state as { desde?: string } | null)?.desde ?? '/'

  if (usuario) return <Navigate to={desde} replace />

  async function ingresar(username: string, password: string) {
    setError(null)
    try {
      await login(username, password)
      navigate(desde, { replace: true })
    } catch (e) {
      // 401: credenciales incorrectas · 400: cuenta desactivada
      setError(handleApiError(e, 'No se pudo iniciar sesión'))
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <Card className="p-6">
        <h1 className="text-2xl font-extrabold text-stone-900">Ingresar</h1>
        <p className="mb-6 mt-1 text-sm text-stone-500">Iniciá sesión para confirmar tus pedidos.</p>
        <LoginForm onSubmit={ingresar} error={error} />
        <p className="mt-6 text-center text-sm text-stone-600">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-semibold text-orange-700 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
