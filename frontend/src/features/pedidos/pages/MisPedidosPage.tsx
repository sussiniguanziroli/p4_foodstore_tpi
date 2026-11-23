import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { formatFecha, formatPrecio } from '@/shared/utils/formato'
import { ModalDetallePedido } from '../components/ModalDetallePedido'
import { useCancelarPedido } from '../hooks/useCancelarPedido'
import { usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const LIMIT = 10

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)
  const location = useLocation()
  const recienCreado = (location.state as { creado?: boolean } | null)?.creado === true

  // El backend devuelve solo los pedidos del usuario de la sesión (RN-04)
  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: pagina * LIMIT, limit: LIMIT })
  const cancelar = useCancelarPedido()

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-stone-900">Mis pedidos</h1>
      <p className="mb-6 mt-1 text-sm text-stone-500">Seguí el estado de tus pedidos. Podés cancelarlos mientras estén pendientes.</p>

      {recienCreado && (
        <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          ¡Pedido confirmado! Lo vas a ver acá abajo como «Pendiente».
        </p>
      )}
      {cancelar.isError && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {handleApiError(cancelar.error, 'No se pudo cancelar el pedido')}
        </p>
      )}

      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar tus pedidos')} onReintentar={() => refetch()} />}

      {data && data.items.length === 0 && (
        <EstadoVacio
          titulo="Todavía no hiciste pedidos"
          accion={
            <Link to="/" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
              Ir al catálogo
            </Link>
          }
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <ul className="space-y-3">
            {data.items.map((pedido) => (
              <li
                key={pedido.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="min-w-48 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">Pedido #{pedido.id}</span>
                    <BadgeEstado estado={pedido.estado} />
                  </div>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatFecha(pedido.created_at)} · {pedido.items.reduce((s, i) => s + i.cantidad, 0)} u. ·{' '}
                    {pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
                  </p>
                </div>
                <span className="text-lg font-extrabold text-stone-900">{formatPrecio(pedido.total)}</span>
                <div className="flex gap-2">
                  <Button variante="secundario" tamano="sm" onClick={() => setDetalleId(pedido.id)}>
                    Ver detalle
                  </Button>
                  {/* Cancelar solo en PENDIENTE (RN-04); el backend lo vuelve a validar */}
                  {pedido.estado === 'PENDIENTE' && (
                    <Button variante="peligro" tamano="sm" onClick={() => setACancelar(pedido)}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Paginacion pagina={pagina} total={data.total} limit={LIMIT} onCambiar={setPagina} />
        </>
      )}

      {detalleId !== null && <ModalDetallePedido pedidoId={detalleId} onClose={() => setDetalleId(null)} />}

      {aCancelar && (
        <Modal titulo={`¿Cancelar el pedido #${aCancelar.id}?`} onClose={() => setACancelar(null)}>
          <p className="text-sm text-stone-600">
            El pedido pasa a «Cancelado» y los productos vuelven al stock. Esta acción no se puede deshacer.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variante="secundario" onClick={() => setACancelar(null)}>
              Volver
            </Button>
            <Button
              variante="peligro"
              cargando={cancelar.isPending}
              onClick={() => cancelar.mutate(aCancelar.id, { onSettled: () => setACancelar(null) })}
            >
              Sí, cancelar
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
