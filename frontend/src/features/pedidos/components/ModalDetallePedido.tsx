import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { Modal } from '@/shared/ui/Modal'
import { usePedido } from '../hooks/usePedidos'
import { PedidoDetalle } from './PedidoDetalle'

interface Props {
  pedidoId: number
  onClose: () => void
}

/** Pide el detalle con GET /pedidos/{id} (dueño o admin; un pedido ajeno daría 403). */
export function ModalDetallePedido({ pedidoId, onClose }: Props) {
  const { data, isLoading, isError, error, refetch } = usePedido(pedidoId)

  return (
    <Modal titulo={`Pedido #${pedidoId}`} onClose={onClose} ancho="lg">
      {isLoading && <SkeletonFilas cantidad={4} />}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudo cargar el pedido')} onReintentar={() => refetch()} />}
      {data && <PedidoDetalle pedido={data} />}
    </Modal>
  )
}
