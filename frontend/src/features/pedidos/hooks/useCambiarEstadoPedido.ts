import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cambiarEstadoPedido } from '../api/pedidos'
import type { EstadoPedido } from '../types/pedido'

/** Admin: PATCH /pedidos/{id}/estado. Si cancela, el backend restituye stock: se refrescan productos. */
export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] }) // incluye la lista, el detalle y el resumen
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
