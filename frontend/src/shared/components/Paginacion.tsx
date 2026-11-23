import { Button } from '@/shared/ui/Button'

interface Props {
  /** Página actual, empezando en 0 (skip = pagina × limit). */
  pagina: number
  total: number
  limit: number
  onCambiar: (pagina: number) => void
}

/** Paginación del lado del servidor: muestra "Página X de Y" y botones anterior/siguiente. */
export function Paginacion({ pagina, total, limit, onCambiar }: Props) {
  const totalPaginas = Math.max(Math.ceil(total / limit), 1)
  if (total <= limit) return null

  return (
    <nav aria-label="Paginación" className="mt-6 flex items-center justify-center gap-3 text-sm text-stone-600">
      <Button variante="secundario" tamano="sm" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 0}>
        ← Anterior
      </Button>
      <span>
        Página <strong>{pagina + 1}</strong> de {totalPaginas}
      </span>
      <Button
        variante="secundario"
        tamano="sm"
        onClick={() => onCambiar(pagina + 1)}
        disabled={pagina + 1 >= totalPaginas}
      >
        Siguiente →
      </Button>
    </nav>
  )
}
