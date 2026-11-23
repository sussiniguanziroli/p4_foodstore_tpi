import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { Skeleton } from '@/shared/components/Skeleton'
import { formatPrecio } from '@/shared/utils/formato'
import { TarjetaResumen } from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/useResumenPedidos'

export function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-stone-900">Resumen del negocio</h1>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudo cargar el resumen')} onReintentar={() => refetch()} />}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pedidos de hoy" valor={data.pedidos_hoy} detalle="Creados desde las 00:00" acento="orange" />
          <TarjetaResumen
            titulo="Ingresos entregados"
            valor={formatPrecio(data.ingresos_entregados)}
            detalle="Suma del total de los pedidos ENTREGADO"
            acento="violet"
          />
          <TarjetaResumen titulo="Pendientes" valor={data.pendientes} detalle="Esperan que se empiecen a preparar" acento="amber" />
          <TarjetaResumen titulo="En preparación" valor={data.en_preparacion} acento="sky" />
          <TarjetaResumen titulo="Entregados" valor={data.entregados} acento="emerald" />
          <TarjetaResumen titulo="Cancelados" valor={data.cancelados} detalle="Su stock ya fue restituido" acento="stone" />
        </div>
      )}
    </div>
  )
}
