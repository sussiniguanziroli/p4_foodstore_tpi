import { useEffect, useState } from 'react'

/**
 * Devuelve `valor` recién cuando deja de cambiar durante `ms` milisegundos.
 * Evita una petición por cada tecla en el buscador. Este useEffect NO pide datos:
 * solo programa un temporizador; la petición la hace useQuery cuando cambia la queryKey.
 */
export function useDebounce<T>(valor: T, ms = 350): T {
  const [demorado, setDemorado] = useState(valor)
  useEffect(() => {
    const id = setTimeout(() => setDemorado(valor), ms)
    return () => clearTimeout(id)
  }, [valor, ms])
  return demorado
}
