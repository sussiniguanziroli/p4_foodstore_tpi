import { formatPrecio } from '@/shared/utils/formato'
import { useCartStore, type CartItem } from '@/store/cartStore'

/** Una fila del carrito: cantidad editable, subtotal y botón quitar. */
export function CarritoItem({ item }: { item: CartItem }) {
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)
  // El + se deshabilita al llegar al stock disponible
  const enElMaximo = item.stock !== undefined && item.cantidad >= item.stock

  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <div className="min-w-40 flex-1">
        <p className="font-semibold text-stone-900">{item.nombre}</p>
        <p className="text-sm text-stone-500">
          {formatPrecio(item.precio_unitario)} c/u
          {item.stock !== undefined && <span className="ml-2 text-xs text-stone-400">· Disponibles: {item.stock}</span>}
        </p>
      </div>

      <div className="flex items-center rounded-lg border border-stone-300" role="group" aria-label={`Cantidad de ${item.nombre}`}>
        <button
          type="button"
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
          className="px-3 py-1.5 text-lg leading-none text-stone-600 hover:bg-stone-100"
          aria-label="Restar uno"
        >
          −
        </button>
        <span className="w-10 text-center font-semibold" aria-live="polite">
          {item.cantidad}
        </span>
        <button
          type="button"
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
          disabled={enElMaximo}
          title={enElMaximo ? 'No hay más stock disponible' : undefined}
          className="px-3 py-1.5 text-lg leading-none text-stone-600 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Sumar uno"
        >
          +
        </button>
      </div>

      <p className="w-28 text-right font-bold text-stone-900">{formatPrecio(item.precio_unitario * item.cantidad)}</p>

      <button
        type="button"
        onClick={() => quitar(item.producto_id)}
        className="text-sm font-medium text-red-600 hover:underline"
      >
        Quitar
      </button>
    </li>
  )
}
