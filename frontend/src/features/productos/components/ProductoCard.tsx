import { formatPrecio } from '@/shared/utils/formato'
import { Button } from '@/shared/ui/Button'
import { useCartStore } from '@/store/cartStore'
import type { Producto } from '../types/producto'

interface Props {
  producto: Producto
}

/** Tarjeta del catálogo. Lee el carrito para no permitir agregar más unidades que el stock. */
export function ProductoCard({ producto }: Props) {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)

  const sinStock = producto.stock === 0
  const sePuedeVender = producto.disponible && !sinStock
  const alcanzoElStock = enCarrito >= producto.stock

  let etiqueta = 'Agregar al carrito'
  if (!producto.disponible) etiqueta = 'No disponible'
  else if (sinStock) etiqueta = 'Sin stock'
  else if (alcanzoElStock) etiqueta = 'Máximo en el carrito'

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-40 bg-gradient-to-br from-orange-100 via-amber-50 to-stone-100">
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden="true" className="grid h-full place-items-center text-5xl font-black text-orange-300">
            {producto.nombre.charAt(0)}
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-stone-700 shadow-sm">
          {producto.categoria.nombre}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-stone-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>}

        <div className="mt-auto flex items-end justify-between pt-4">
          <span className="text-xl font-extrabold text-stone-900">{formatPrecio(producto.precio_base)}</span>
          <span className={`text-xs font-medium ${sePuedeVender ? 'text-emerald-700' : 'text-red-600'}`}>
            {!producto.disponible ? 'Pausado' : sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
          </span>
        </div>

        <Button
          className="mt-3 w-full"
          disabled={!sePuedeVender || alcanzoElStock}
          onClick={() =>
            agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base })
          }
        >
          {etiqueta}
          {enCarrito > 0 && sePuedeVender && !alcanzoElStock && (
            <span className="rounded-full bg-white/25 px-1.5 text-xs">{enCarrito}</span>
          )}
        </Button>
      </div>
    </article>
  )
}
