import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getPedido, getPedidos } from '../api/pedidos'
import type { FiltrosPedidos } from '../types/pedido'

/** Pedidos paginados: los propios (rol user) o todos (rol admin). Lo decide el backend. */
export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ['pedidos', 'lista', filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
}

/** Detalle de un pedido con sus líneas. `enabled`: no pide nada hasta que haya un id elegido. */
export function usePedido(id: number | null) {
  return useQuery({
    queryKey: ['pedidos', 'detalle', id],
    queryFn: () => getPedido(id as number),
    enabled: id !== null,
  })
}
