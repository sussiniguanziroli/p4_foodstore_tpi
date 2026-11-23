import { useQuery } from '@tanstack/react-query'
import { getResumenPedidos } from '../api/pedidos'

/** Indicadores del panel. Comparte el prefijo ['pedidos']: cualquier mutación de pedidos lo invalida. */
export function useResumenPedidos() {
  return useQuery({
    queryKey: ['pedidos', 'resumen'],
    queryFn: getResumenPedidos,
  })
}
