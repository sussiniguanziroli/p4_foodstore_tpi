import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import type { UsuarioCreate } from '@/features/usuarios'
import { handleApiError } from '@/shared/api/handleApiError'
import { Card } from '@/shared/ui/Card'
import { useAuthStore } from '@/store/authStore'
import { registerApi } from '../api/auth'
import { RegisterForm } from '../components/RegisterForm'

export function RegisterPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  if (usuario) return <Navigate to="/" replace />

  async function registrar(datos: UsuarioCreate) {
    setError(null)
    try {
      await registerApi(datos) // 201: la cuenta se crea con rol user
      await login(datos.username, datos.password) // y se inicia la sesión directamente
      navigate('/', { replace: true })
    } catch (e) {
      // 409: username o email repetidos · 422: datos inválidos
      setError(handleApiError(e, 'No se pudo crear la cuenta'))
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="text-2xl font-extrabold text-stone-900">Crear cuenta</h1>
        <p className="mb-6 mt-1 text-sm text-stone-500">Registrate para hacer pedidos y seguirlos.</p>
        <RegisterForm onSubmit={registrar} error={error} />
        <p className="mt-6 text-center text-sm text-stone-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-orange-700 hover:underline">
            Ingresá
          </Link>
        </p>
      </Card>
    </div>
  )
}
