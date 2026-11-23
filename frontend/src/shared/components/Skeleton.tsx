/** Bloque gris animado que ocupa el lugar del contenido mientras carga. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-stone-200 ${className}`} />
}

/** Grilla de tarjetas "fantasma" para el catálogo. */
export function SkeletonTarjetas({ cantidad = 6 }: { cantidad?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="rounded-2xl border border-stone-200 bg-white p-4">
          <Skeleton className="mb-4 h-36 w-full" />
          <Skeleton className="mb-2 h-4 w-2/3" />
          <Skeleton className="mb-4 h-3 w-1/2" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

/** Filas "fantasma" para tablas y listas. */
export function SkeletonFilas({ cantidad = 5 }: { cantidad?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="space-y-3">
      {Array.from({ length: cantidad }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
