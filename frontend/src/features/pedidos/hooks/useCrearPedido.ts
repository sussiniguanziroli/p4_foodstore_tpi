import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPedido } from '../api/pedidos'
import type { PedidoCreate } from '../types/pedido'

/** POST /pedidos. Al crear, cambian los pedidos y el stock: se invalidan las dos cachés. */
export function useCrearPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: PedidoCreate) => createPedido(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
