import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma' | 'fantasmaPeligro'
type Tamano = 'sm' | 'md'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
  cargando?: boolean
}

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-orange-600 text-white hover:bg-orange-700 focus-visible:outline-orange-600',
  secundario: 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-100 focus-visible:outline-stone-400',
  peligro: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
  fantasma: 'text-stone-700 hover:bg-stone-100 focus-visible:outline-stone-400',
  fantasmaPeligro: 'text-red-700 hover:bg-red-50 focus-visible:outline-red-400',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

/** Botón base. `cargando` lo deshabilita y muestra puntos suspensivos. */
export function Button({
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    >
      {children}
      {cargando && <span aria-hidden="true">…</span>}
    </button>
  )
}
