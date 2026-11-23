import { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

/**
 * Instancia única de TanStack Query: guarda en caché el estado del servidor
 * (catálogo, pedidos, usuarios y resumen).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Los datos se consideran frescos 30 s: navegar entre pantallas no repite la petición
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Un 4xx no se arregla reintentando (401, 403, 404...): solo se reintenta una vez ante red o 5xx
      retry: (intentos, error) => {
        if (isAxiosError(error) && error.response && error.response.status < 500) return false
        return intentos < 1
      },
    },
  },
})
