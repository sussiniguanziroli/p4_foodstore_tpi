import { isAxiosError } from 'axios'

interface ErrorDeValidacion {
  loc?: (string | number)[]
  msg?: string
}

/**
 * Convierte un error de la API en un mensaje para la pantalla.
 * - detail string (400, 401, 403, 404, 409): se muestra tal cual lo escribió el backend.
 * - detail lista (422 de validación): se arma "campo: mensaje".
 * - sin respuesta: el servidor no está levantado o no hay red.
 */
export function handleApiError(error: unknown, porDefecto = 'Ocurrió un error inesperado'): string {
  if (!isAxiosError(error)) return porDefecto
  if (!error.response) return 'No se pudo conectar con el servidor. ¿Está corriendo el backend?'

  const detail: unknown = error.response.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    return (detail as ErrorDeValidacion[])
      .map((e) => {
        const campo = e.loc?.filter((p) => p !== 'body').join('.')
        return campo ? `${campo}: ${e.msg ?? 'valor inválido'}` : (e.msg ?? 'valor inválido')
      })
      .join(' · ')
  }
  if (error.response.status >= 500) return 'Error interno del servidor. Probá de nuevo en unos segundos.'
  return porDefecto
}
