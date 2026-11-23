import { Button } from '@/shared/ui/Button'

interface Props {
  mensaje: string
  onReintentar?: () => void
}

/** Error al cargar datos: muestra el detail de la API y el botón Reintentar (refetch). */
export function EstadoError({ mensaje, onReintentar }: Props) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
      <p className="text-sm text-red-800">{mensaje}</p>
      {onReintentar && (
        <Button variante="secundario" tamano="sm" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
