import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activarUsuario, desactivarUsuario, getUsuarios } from '../api/usuarios'

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
  })
}

/** Activar y desactivar (baja lógica). Al terminar se invalida ['usuarios'] y la tabla se actualiza. */
export function useMutacionesUsuario() {
  const queryClient = useQueryClient()
  const refrescar = () => queryClient.invalidateQueries({ queryKey: ['usuarios'] })

  const activar = useMutation({
    mutationFn: (id: number) => activarUsuario(id),
    onSuccess: refrescar,
  })

  const desactivar = useMutation({
    mutationFn: (id: number) => desactivarUsuario(id),
    onSuccess: refrescar,
  })

  return { activar, desactivar }
}
