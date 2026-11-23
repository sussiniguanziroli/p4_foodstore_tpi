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
import { EstadoError } from '@/shared/components/EstadoError'
import { SkeletonFilas } from '@/shared/components/Skeleton'
import { TablaDatos } from '@/shared/components/TablaDatos'
import { Button } from '@/shared/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useMutacionesUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '../types/usuario'

const columna = createColumnHelper<Usuario>()

export function AdminUsuariosPage() {
  const { data, isLoading, isError, error, refetch } = useUsuarios()
  const { activar, desactivar } = useMutacionesUsuario()
  const yo = useAuthStore((s) => s.usuario)
  const [filtro, setFiltro] = useState('')

  const ocupado = activar.isPending || desactivar.isPending
  const errorAccion = activar.error ?? desactivar.error

  const columnas = useMemo(
    () => [
      columna.accessor('username', { header: 'Usuario', cell: (c) => <span className="font-semibold text-stone-900">@{c.getValue()}</span> }),
      columna.accessor('full_name', { header: 'Nombre' }),
      columna.accessor('email', { header: 'Email' }),
      columna.accessor('role', {
        header: 'Rol',
        cell: (c) =>
          c.getValue() === 'admin' ? (
            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">admin</span>
          ) : (
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-700">user</span>
          ),
      }),
      columna.accessor('disabled', {
        header: 'Estado',
        cell: (c) =>
          c.getValue() ? (
            <span className="font-medium text-red-600">Desactivado</span>
          ) : (
            <span className="font-medium text-emerald-700">Activo</span>
          ),
      }),
      columna.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const u = row.original
          if (u.disabled) {
            return (
              <Button tamano="sm" disabled={ocupado} onClick={() => activar.mutate(u.id)}>
                Activar
              </Button>
            )
          }
          // El botón Desactivar no se muestra en la fila del usuario de la sesión (el backend igual responde 400)
          if (u.id === yo?.id) return <span className="text-xs text-stone-400">Tu cuenta</span>
          return (
            <Button variante="secundario" tamano="sm" disabled={ocupado} onClick={() => desactivar.mutate(u.id)}>
              Desactivar
            </Button>
          )
        },
      }),
    ],
    [activar, desactivar, ocupado, yo?.id],
  )

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

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-stone-900">Usuarios</h1>
        <input
          type="search"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Filtrar…"
          aria-label="Filtrar usuarios"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
        />
      </div>

      {errorAccion && (
        <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {handleApiError(errorAccion)}
        </p>
      )}

      {isLoading && <SkeletonFilas />}
      {isError && <EstadoError mensaje={handleApiError(error, 'No se pudieron cargar los usuarios')} onReintentar={() => refetch()} />}
      {data && <TablaDatos table={table} mensajeVacio="No hay usuarios." />}
    </div>
  )
}
