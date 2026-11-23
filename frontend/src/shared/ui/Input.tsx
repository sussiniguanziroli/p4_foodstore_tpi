import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const BASE =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 disabled:bg-stone-100'
const NORMAL = 'border-stone-300 focus:border-orange-500 focus:ring-orange-200'
const CON_ERROR = 'border-red-400 focus:border-red-500 focus:ring-red-200'

interface CampoProps {
  id: string
  label: string
  error?: string
  ayuda?: string
  children: ReactNode
}

/** Etiqueta + control + mensaje de error (o de ayuda) debajo. */
function Campo({ id, label, error, ayuda, children }: CampoProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : (
        ayuda && <p className="mt-1 text-xs text-stone-500">{ayuda}</p>
      )}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  ayuda?: string
}

export function Input({ id, label, error, ayuda, className = '', ...props }: InputProps) {
  return (
    <Campo id={id} label={label} error={error} ayuda={ayuda}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${BASE} ${error ? CON_ERROR : NORMAL} ${className}`}
        {...props}
      />
    </Campo>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string
  label: string
  error?: string
}

export function Textarea({ id, label, error, className = '', ...props }: TextareaProps) {
  return (
    <Campo id={id} label={label} error={error}>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        className={`${BASE} ${error ? CON_ERROR : NORMAL} ${className}`}
        {...props}
      />
    </Campo>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string
  label: string
  error?: string
}

export function Select({ id, label, error, className = '', children, ...props }: SelectProps) {
  return (
    <Campo id={id} label={label} error={error}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${BASE} ${error ? CON_ERROR : NORMAL} ${className}`}
        {...props}
      >
        {children}
      </select>
    </Campo>
  )
}

/** Primer error de un campo de TanStack Form, solo si el usuario ya lo tocó. */
export function primerError(meta: { isTouched: boolean; errors: unknown[] }): string | undefined {
  if (!meta.isTouched) return undefined
  const error = meta.errors.find((e) => typeof e === 'string')
  return typeof error === 'string' ? error : undefined
}
