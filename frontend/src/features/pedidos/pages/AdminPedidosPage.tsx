import { useMemo, useState } from 'react'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { handleApiError } from '@/shared/api/handleApiError'
import { ConfirmarAccion } from '@/shared/components/ConfirmarAccion'
import { EstadoError } from '@/shared/components/EstadoError'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { TablaDatos } from '@/shared/components/TablaDatos'
import { BadgeEstado, textoEstado } from '@/shared/ui/BadgeEstado'
import { Button } from '@/shared/ui/Button'
import { formatFecha, formatPrecio } from '@/shared/utils/formato'
import { useUsuarios } from '@/features/usuarios'
import { ModalDetallePedido } from '../components/ModalDetallePedido'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido'
import { usePedidos } from '../hooks/usePedidos'
import { ESTADOS_PEDIDO, TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

const LIMIT = 10
const columna = createColumnHelper<Pedido>()

export function AdminPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalleId, setDetalleId] = useState<number | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)

  // Paginación y filtro por estado en el servidor (el admin ve todos los pedidos)
  const { data, isLoading, isError, error, refetch } = usePedidos({ skip: pagina * LIMIT, limit: LIMIT, estado })
  const cambiarEstado = useCambiarEstadoPedido()
  // PedidoRead trae usuario_id: el nombre se toma del listado de usuarios (también es solo admin)
  const usuarios = useUsuarios()
  const nombres = useMemo(
    () => new Map((usuarios.data ?? []).map((u) => [u.id, `${u.full_name} (@${u.username})`])),
    [usuarios.data],
  )

  const columnas = useMemo(
    () => [
      columna.accessor('id', { header: 'N.º', cell: (c) => <span className="font-bold">#{c.getValue()}</span> }),
      columna.accessor('created_at', { header: 'Fecha', cell: (c) => formatFecha(c.getValue()) }),
      columna.accessor('usuario_id', {
        header: 'Cliente',
        cell: (c) => nombres.get(c.getValue()) ?? `Usuario #${c.getValue()}`,
      }),
      columna.accessor('forma_pago', {
        header: 'Pago',
        cell: (c) => (c.getValue() === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'),
      }),
      columna.accessor('total', { header: 'Total', cell: (c) => <span className="font-semibold">{formatPrecio(c.getValue())}</span> }),
      columna.accessor('estado', { header: 'Estado', cell: (c) => <BadgeEstado estado={c.getValue()} /> }),
      columna.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const pedido = row.original
          // Solo se ofrecen las transiciones válidas según la máquina de estados (RN-02)
          const siguientes = TRANSICIONES[pedido.estado]
          return (
            <div className="flex flex-wrap gap-1.5">
              <Button variante="fantasma" tamano="sm" onClick={() => setDetalleId(pedido.id)}>
                Ver
              </Button>
              {siguientes
                .filter((e) => e !== 'CANCELADO')
                .map((e) => (
                  <Button
                    key={e}
                    tamano="sm"
                    disabled={cambiarEstado.isPending}
                    onClick={() => cambiarEstado.mutate({ id: pedido.id, estado: e })}
                  >
                    → {textoEstado(e)}
                  </Button>
                ))}
              {siguientes.includes('CANCELADO') && (
                <Button variante="secundario" tamano="sm" onClick={() => setACancelar(pedido)}>
                  Cancelar
                </Button>
              )}
            </div>
          )
        },
      }),
    ],
    [cambiarEstado, nombres],
  )

  const table = useReactTable({
    data: data?.items ?? [],
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // la página la trae el servidor
  })

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-stone-900">Pedidos</h1>
        <label className="text-sm">
          <span className="mr-2 font-medium text-stone-700">Estado</span>
          <select
            value={estado ?? ''}
            onChange={(e) => {
              setEstado(e.target.value ? (e.target.value as EstadoPedido) : undefined)
              setPagina(0)
            }}
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {ESTADOS_PEDIDO.map((e) => (
              <option key={e} value={e}>
                {textoEstado(e)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {cambiarEstado.isError && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {handleApiError(cambiarEstado.error, 'No se pudo cambiar el estado')}
        </p>
      )}

      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar los pedidos')} onReintentar={() => refetch()} />}
      {data && (
        <>
          <TablaDatos table={table} paginar={false} mensajeVacio="No hay pedidos con ese estado." />
          <Paginacion pagina={pagina} total={data.total} limit={LIMIT} onCambiar={setPagina} />
        </>
      )}

      {detalleId !== null && <ModalDetallePedido pedidoId={detalleId} onClose={() => setDetalleId(null)} />}

      {aCancelar && (
        <ConfirmarAccion
          titulo={`¿Cancelar el pedido #${aCancelar.id}?`}
          textoConfirmar="Sí, cancelar"
          cargando={cambiarEstado.isPending}
          onClose={() => setACancelar(null)}
          onConfirmar={() =>
            cambiarEstado.mutate({ id: aCancelar.id, estado: 'CANCELADO' }, { onSettled: () => setACancelar(null) })
          }
        >
          El pedido pasa a «Cancelado» y el stock de cada línea vuelve al producto en la misma transacción (RN-03).
        </ConfirmarAccion>
      )}
    </div>
  )
}
