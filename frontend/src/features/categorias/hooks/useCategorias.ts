import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../api/categorias'
import type { CategoriaInput } from '../types/categoria'

/** Categorías activas: las usan el filtro del catálogo, el formulario de productos y el ABM. */
export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  })
}

export function useMutacionesCategoria() {
  const queryClient = useQueryClient()
  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: ['categorias'] })
    // Los productos muestran el nombre de su categoría: también se refrescan
    queryClient.invalidateQueries({ queryKey: ['productos'] })
  }

  const crear = useMutation({
    mutationFn: (datos: CategoriaInput) => createCategoria(datos),
    onSuccess: refrescar,
  })

  const actualizar = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Partial<CategoriaInput> }) => updateCategoria(id, datos),
    onSuccess: refrescar,
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: refrescar,
  })

  return { crear, actualizar, eliminar }
}
