import { useMemo, useState } from 'react'
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { handleApiError } from '@/shared/api/handleApiError'
import { ConfirmarAccion } from '@/shared/components/ConfirmarAccion'
import { EstadoError } from '@/shared/components/EstadoError'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { TablaDatos } from '@/shared/components/TablaDatos'
import { Button } from '@/shared/ui/Button'
import { CategoriaForm } from '../components/CategoriaForm'
import { useCategorias, useMutacionesCategoria } from '../hooks/useCategorias'
import type { Categoria, CategoriaInput } from '../types/categoria'

const columna = createColumnHelper<Categoria>()

export function AdminCategoriasPage() {
  const { data, isLoading, isError, error, refetch } = useCategorias()
  const { crear, actualizar, eliminar } = useMutacionesCategoria()

  // undefined = modal cerrado · null = alta · Categoria = edición
  const [editando, setEditando] = useState<Categoria | null | undefined>(undefined)
  const [errorForm, setErrorForm] = useState<string | null>(null)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)
  const [filtro, setFiltro] = useState('')

  const columnas = useMemo(
    () => [
      columna.accessor('id', { header: 'ID' }),
      columna.accessor('nombre', { header: 'Nombre', cell: (c) => <span className="font-semibold text-stone-900">{c.getValue()}</span> }),
      columna.accessor('descripcion', { header: 'Descripción', enableSorting: false, cell: (c) => c.getValue() ?? '—' }),
      columna.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-1.5">
            <Button variante="secundario" tamano="sm" onClick={() => abrir(row.original)}>
              Editar
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

  // Paginación del lado del cliente: el listado completo ya está en memoria
  const table = useReactTable({
    data: data ?? [],
    columns: columnas,
    state: { globalFilter: filtro },
    onGlobalFilterChange: setFiltro,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  function abrir(categoria: Categoria | null) {
    setErrorForm(null)
    setEditando(categoria)
  }

  async function guardar(datos: CategoriaInput) {
    setErrorForm(null)
    try {
      if (editando) await actualizar.mutateAsync({ id: editando.id, datos })
      else await crear.mutateAsync(datos)
      setEditando(undefined)
    } catch (e) {
      setErrorForm(handleApiError(e, 'No se pudo guardar la categoría'))
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-stone-900">Categorías</h1>
        <div className="flex gap-2">
          <input
            type="search"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Filtrar…"
            aria-label="Filtrar categorías"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <Button onClick={() => abrir(null)}>+ Nueva categoría</Button>
        </div>
      </div>

      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar las categorías')} onReintentar={() => refetch()} />}
      {data && <TablaDatos table={table} mensajeVacio="No hay categorías." />}

      {editando !== undefined && (
        <CategoriaForm categoria={editando} error={errorForm} onSubmit={guardar} onClose={() => setEditando(undefined)} />
      )}

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
          Es una baja lógica: la categoría deja de listarse, pero su nombre sigue reservado y sus productos siguen en el
          catálogo. Para retirarlos, dalos de baja desde Productos.
        </ConfirmarAccion>
      )}
    </div>
  )
}
