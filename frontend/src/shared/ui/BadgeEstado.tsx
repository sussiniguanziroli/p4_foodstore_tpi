import type { EstadoPedido } from '@/features/pedidos'

const ESTILOS: Record<EstadoPedido, { clase: string; texto: string }> = {
  PENDIENTE: { clase: 'bg-amber-100 text-amber-800 ring-amber-300', texto: 'Pendiente' },
  EN_PREPARACION: { clase: 'bg-sky-100 text-sky-800 ring-sky-300', texto: 'En preparación' },
  ENTREGADO: { clase: 'bg-emerald-100 text-emerald-800 ring-emerald-300', texto: 'Entregado' },
  CANCELADO: { clase: 'bg-stone-200 text-stone-700 ring-stone-300', texto: 'Cancelado' },
}

/** Etiqueta de color para cada uno de los cuatro estados del pedido. */
export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { clase, texto } = ESTILOS[estado]
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${clase}`}>
      {texto}
    </span>
  )
}

export function textoEstado(estado: EstadoPedido): string {
  return ESTILOS[estado].texto
}
