import { useState } from 'react'
import { useCategorias } from '@/features/categorias'
import { handleApiError } from '@/shared/api/handleApiError'
import { EstadoError } from '@/shared/components/EstadoError'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Paginacion } from '@/shared/components/Paginacion'
import { SkeletonTarjetas } from '@/shared/components/Skeleton'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { Button } from '@/shared/ui/Button'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const LIMIT = 9 // productos por página (grilla de 3 × 3)

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)
  const busquedaDemorada = useDebounce(busqueda.trim())

  // Paginación en el servidor: skip = página × limit
  const { data, isLoading, isError, error, refetch, isFetching } = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search: busquedaDemorada || undefined,
    categoria_id: categoriaId,
  })
  const categorias = useCategorias()

  const hayFiltros = busqueda !== '' || categoriaId !== undefined

  function cambiarCategoria(id: number | undefined) {
    setCategoriaId(id)
    setPagina(0) // con otro filtro se vuelve a la primera página
  }

  return (
    <div>
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-8 text-white shadow-sm">
        <h1 className="text-3xl font-black tracking-tight">¿Qué pedimos hoy?</h1>
        <p className="mt-1 text-orange-50">Elegí del catálogo, armá tu carrito y te lo llevamos.</p>
        <div className="mt-5 max-w-md">
          <label htmlFor="buscar" className="sr-only">
            Buscar productos
          </label>
          <input
            id="buscar"
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value)
              setPagina(0)
            }}
            placeholder="Buscar por nombre…"
            className="w-full rounded-xl border-0 bg-white px-4 py-3 text-stone-900 shadow-sm placeholder:text-stone-400 focus:outline-none focus:ring-4 focus:ring-orange-300"
          />
        </div>
      </section>

      {/* Filtro por categoría */}
      <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por categoría">
        <button
          type="button"
          onClick={() => cambiarCategoria(undefined)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            categoriaId === undefined ? 'bg-stone-900 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100'
          }`}
        >
          Todas
        </button>
        {categorias.data?.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => cambiarCategoria(c.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              categoriaId === c.id ? 'bg-stone-900 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100'
            }`}
          >
            {c.nombre}
          </button>
        ))}
        {isFetching && !isLoading && <span className="text-xs text-stone-400">Actualizando…</span>}
      </div>

      {isLoading && <SkeletonTarjetas cantidad={LIMIT} />}

      {isError && (
        <EstadoError mensaje={handleApiError(error, 'No se pudo cargar el catálogo')} onReintentar={() => refetch()} />
      )}

      {data && data.items.length === 0 && (
        <EstadoVacio
          titulo={hayFiltros ? 'No encontramos productos con esos filtros' : 'Todavía no hay productos en el catálogo'}
          mensaje={hayFiltros ? 'Probá con otra búsqueda o con otra categoría.' : undefined}
          accion={
            hayFiltros ? (
              <Button
                variante="secundario"
                onClick={() => {
                  setBusqueda('')
                  cambiarCategoria(undefined)
                }}
              >
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <p className="mb-3 text-sm text-stone-500">
            {data.total} producto{data.total === 1 ? '' : 's'}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} total={data.total} limit={LIMIT} onCambiar={setPagina} />
        </>
      )}
    </div>
  )
}
