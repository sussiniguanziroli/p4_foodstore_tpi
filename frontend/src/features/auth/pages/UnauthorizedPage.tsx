import { Link } from 'react-router-dom'
import { Card } from '@/shared/ui/Card'

/** Destino de ProtectedRoute cuando hay sesión pero el rol no alcanza (equivale al 403 del backend). */
export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card className="p-8 text-center">
        <div aria-hidden="true" className="mb-3 text-5xl">
          🔒
        </div>
        <h1 className="text-xl font-bold text-stone-900">No tenés permiso para ver esta página</h1>
        <p className="mt-2 text-sm text-stone-500">Esta sección es solo para administradores.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
          Volver al inicio
        </Link>
      </Card>
    </div>
  )
}
