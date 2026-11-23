import { flexRender, type Table } from '@tanstack/react-table'
import { Button } from '@/shared/ui/Button'

interface Props<T> {
  /** Instancia creada con useReactTable en la página: este componente solo arma el marcado. */
  table: Table<T>
  /** false cuando la paginación la hace el servidor (la página dibuja su propia Paginacion). */
  paginar?: boolean
  mensajeVacio?: string
}

const INDICADOR = { asc: ' ▲', desc: ' ▼' } as const

/** Tabla genérica de TanStack Table: encabezados ordenables y paginación del lado del cliente. */
export function TablaDatos<T>({ table, paginar = true, mensajeVacio = 'No hay registros.' }: Props<T>) {
  const filas = table.getRowModel().rows
  const { pageIndex } = table.getState().pagination

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => {
                  const orden = header.column.getIsSorted()
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={orden === 'asc' ? 'ascending' : orden === 'desc' ? 'descending' : undefined}
                      className="whitespace-nowrap px-4 py-3 font-semibold"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="font-semibold uppercase tracking-wide hover:text-orange-700"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {orden ? INDICADOR[orden] : ''}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filas.length === 0 ? (
              <tr>
                <td colSpan={table.getAllLeafColumns().length} className="px-4 py-10 text-center text-stone-500">
                  {mensajeVacio}
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.id} className="hover:bg-orange-50/40">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3 align-middle text-stone-700">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginar && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
          <span>
            Página {pageIndex + 1} de {Math.max(table.getPageCount(), 1)} · {table.getPrePaginationRowModel().rows.length}{' '}
            registros
          </span>
          <div className="flex gap-2">
            <Button variante="secundario" tamano="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Anterior
            </Button>
            <Button variante="secundario" tamano="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
