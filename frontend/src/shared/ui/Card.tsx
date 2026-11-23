import type { HTMLAttributes } from 'react'

/** Contenedor con borde, fondo blanco y sombra suave. */
export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`} {...props}>
      {children}
    </div>
  )
}
