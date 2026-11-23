import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useCategorias } from '@/features/categorias'
import { handleApiError } from '@/shared/api/handleApiError'
import { ConfirmarAccion } from '@/shared/components/ConfirmarAccion'
import { EstadoError } from '@/shared/components/EstadoError'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { TablaDatos } from '@/shared/components/TablaDatos'
import { Button } from '@/shared/ui/Button'
import { formatPrecio } from '@/shared/utils/formato'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import { useMutacionesProducto, useProductos } from '../hooks/useProductos'
import type { Producto, ProductoInput, ProductoStockUpdate } from '../types/producto'

const columna = createColumnHelper<Producto>()

export function AdminProductosPage() {
  // El panel pide limit=100 (el máximo de la API) y pagina del lado del cliente con TanStack Table
  const { data, isLoading, isError, error, refetch } = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const { crear, actualizar, actualizarStock, eliminar } = useMutacionesProducto()

  const [editando, setEditando] = useState<Producto | null | undefined>(undefined)
  const [stockDe, setStockDe] = useState<Producto | null>(null)
  const [aEliminar, setAEliminar] = useState<Producto | null>(null)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')

  const columnas = useMemo(
    () => [
      columna.accessor('nombre', { header: 'Producto', cell: (c) => <span className="font-semibold text-stone-900">{c.getValue()}</span> }),
      columna.accessor((p) => p.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
      columna.accessor('precio_base', { header: 'Precio', cell: (c) => formatPrecio(c.getValue()) }),
      columna.accessor('stock', {
        header: 'Stock',
        cell: (c) => <span className={c.getValue() === 0 ? 'font-bold text-red-600' : ''}>{c.getValue()}</span>,
      }),
      columna.accessor('disponible', {
        header: 'Disponible',
        cell: (c) =>
          c.getValue() ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Sí</span>
          ) : (
            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-700">Pausado</span>
          ),
      }),
      columna.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1.5">
            <Button variante="secundario" tamano="sm" onClick={() => abrirEdicion(row.original)}>
              Editar
            </Button>
            <Button variante="secundario" tamano="sm" onClick={() => abrirStock(row.original)}>
              Stock
            </Button>
            <Button variante="fantasmaPeligro" tamano="sm" onClick={() => setAEliminar(row.original)}>
              Dar de baja
            </Button>
          </div>
        ),
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: data?.items ?? [],
    columns: columnas,
    state: { globalFilter: filtro },
    onGlobalFilterChange: setFiltro,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  function abrirEdicion(producto: Producto | null) {
    setErrorForm(null)
    setEditando(producto)
  }

  function abrirStock(producto: Producto) {
    setErrorForm(null)
    setStockDe(producto)
  }

  async function guardar(datos: ProductoInput) {
    setErrorForm(null)
    try {
      if (editando) await actualizar.mutateAsync({ id: editando.id, datos })
      else await crear.mutateAsync(datos)
      setEditando(undefined)
    } catch (e) {
      setErrorForm(handleApiError(e, 'No se pudo guardar el producto'))
    }
  }

  async function guardarStock(datos: ProductoStockUpdate) {
    if (!stockDe) return
    setErrorForm(null)
    try {
      await actualizarStock.mutateAsync({ id: stockDe.id, datos })
      setStockDe(null)
    } catch (e) {
      setErrorForm(handleApiError(e, 'No se pudo actualizar el stock'))
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Productos</h1>
          {data && data.total > data.items.length && (
            <p className="text-xs text-stone-500">Se muestran los primeros {data.items.length} de {data.total}.</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar…"
            aria-label="Filtrar productos"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <Button onClick={() => abrirEdicion(null)}>+ Nuevo producto</Button>
        </div>
      </div>

      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar los productos')} onReintentar={() => refetch()} />}
      {data && <TablaDatos table={table} mensajeVacio="No hay productos." />}

      {editando !== undefined && (
        <ProductoForm
          producto={editando}
          categorias={categorias.data ?? []}
          error={errorForm}
          onSubmit={guardar}
          onClose={() => setEditando(undefined)}
        />
      )}

      {stockDe && <StockForm producto={stockDe} error={errorForm} onSubmit={guardarStock} onClose={() => setStockDe(null)} />}

      {aEliminar && (
        <ConfirmarAccion
          titulo={`¿Dar de baja «${aEliminar.nombre}»?`}
          textoConfirmar="Dar de baja"
          cargando={eliminar.isPending}
          error={eliminar.isError ? handleApiError(eliminar.error) : null}
          onClose={() => {
            eliminar.reset()
            setAEliminar(null)
          }}
          onConfirmar={() => eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })}
        >
          Es una baja lógica: el producto sale del catálogo, pero los pedidos que ya lo incluyen conservan su línea con el
          nombre y el precio de la compra.
        </ConfirmarAccion>
      )}
    </div>
  )
}
