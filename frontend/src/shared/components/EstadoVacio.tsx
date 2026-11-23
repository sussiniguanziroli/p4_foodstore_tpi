import type { ReactNode } from 'react'

interface Props {
  titulo: string
  mensaje?: string
  accion?: ReactNode
}

/** Lista sin resultados: mensaje claro y, opcionalmente, una acción (por ejemplo "Ir al catálogo"). */
export function EstadoVacio({ titulo, mensaje, accion }: Props) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
      <div aria-hidden="true" className="mb-3 text-4xl">
        🍽️
      </div>
      <p className="font-semibold text-stone-800">{titulo}</p>
      {mensaje && <p className="mt-1 max-w-sm text-sm text-stone-500">{mensaje}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  )
}
