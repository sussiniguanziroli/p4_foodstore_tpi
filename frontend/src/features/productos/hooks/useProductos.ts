import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
  updateStock,
} from '../api/productos'
import type { FiltrosProductos, ProductoInput, ProductoStockUpdate } from '../types/producto'

/** Listado paginado. La queryKey incluye los filtros: cada combinación tiene su propia caché. */
export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
    // Mientras llega la página nueva se sigue mostrando la anterior (no "parpadea" la grilla)
    placeholderData: keepPreviousData,
  })
}

/** Mutaciones del ABM de productos. Todas invalidan ['productos'] al terminar bien. */
export function useMutacionesProducto() {
  const queryClient = useQueryClient()
  const refrescar = () => queryClient.invalidateQueries({ queryKey: ['productos'] })

  const crear = useMutation({
    mutationFn: (datos: ProductoInput) => createProducto(datos),
    onSuccess: refrescar,
  })

  const actualizar = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Partial<ProductoInput> }) => updateProducto(id, datos),
    onSuccess: refrescar,
  })

  const actualizarStock = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) => updateStock(id, datos),
    onSuccess: refrescar,
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: refrescar,
  })

  return { crear, actualizar, actualizarStock, eliminar }
}
