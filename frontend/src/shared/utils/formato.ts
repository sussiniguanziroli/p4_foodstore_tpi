const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
const fechaHora = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

/** 12500.5 -> "$ 12.500,50" */
export function formatPrecio(valor: number): string {
  return moneda.format(valor)
}

/** ISO del backend (con zona horaria) -> "19/11/26, 21:30" en la hora local del navegador */
export function formatFecha(iso: string): string {
  return fechaHora.format(new Date(iso))
}
