import { BadgeEstado } from '@/shared/ui/BadgeEstado'
import { formatFecha, formatPrecio } from '@/shared/utils/formato'
import type { Pedido } from '../types/pedido'

const TEXTO_PAGO = { EFECTIVO: 'Efectivo', TRANSFERENCIA: 'Transferencia' } as const

/** Detalle de un pedido: datos de entrega y líneas con el precio copiado al momento de la compra. */
export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <BadgeEstado estado={pedido.estado} />
        <span className="text-stone-500">Creado el {formatFecha(pedido.created_at)}</span>
        {pedido.updated_at !== pedido.created_at && (
          <span className="text-stone-500">· Actualizado el {formatFecha(pedido.updated_at)}</span>
        )}
      </div>

      <dl className="grid gap-3 rounded-xl bg-stone-50 p-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">Dirección de entrega</dt>
          <dd className="font-medium text-stone-900">{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">Forma de pago</dt>
          <dd className="font-medium text-stone-900">{TEXTO_PAGO[pedido.forma_pago]}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-stone-500">Notas</dt>
            <dd className="text-stone-800">{pedido.notas}</dd>
          </div>
        )}
      </dl>

      <table className="w-full">
        <thead className="text-left text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="pb-2 font-semibold">Producto</th>
            <th className="pb-2 text-right font-semibold">Precio</th>
            <th className="pb-2 text-right font-semibold">Cant.</th>
            <th className="pb-2 text-right font-semibold">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-2 text-stone-900">{item.nombre_producto}</td>
              <td className="py-2 text-right text-stone-600">{formatPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right text-stone-600">{item.cantidad}</td>
              <td className="py-2 text-right font-medium">{formatPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-stone-200">
            <td colSpan={3} className="pt-3 text-right font-bold">
              Total
            </td>
            <td className="pt-3 text-right text-base font-extrabold">{formatPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
