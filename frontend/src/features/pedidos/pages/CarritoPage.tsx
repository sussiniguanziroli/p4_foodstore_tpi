import { Link } from 'react-router-dom'
import { EstadoVacio } from '@/shared/components/EstadoVacio'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { formatPrecio } from '@/shared/utils/formato'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { CarritoItem } from '../components/CarritoItem'

/** Ruta pública: el carrito vive en el navegador (cartStore con persist) y sobrevive a la recarga. */
export function CarritoPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const vaciar = useCartStore((s) => s.vaciar)
  const usuario = useAuthStore((s) => s.usuario)

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        mensaje="Agregá productos desde el catálogo."
        accion={
          <Link to="/" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
            Ir al catálogo
          </Link>
        }
      />
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-stone-900">Tu carrito</h1>
          <Button variante="fantasma" tamano="sm" onClick={vaciar}>
            Vaciar carrito
          </Button>
        </div>
        <ul className="mt-2 divide-y divide-stone-100">
          {items.map((item) => (
            <CarritoItem key={item.producto_id} item={item} />
          ))}
        </ul>
      </Card>

      <Card className="h-fit p-6">
        <h2 className="font-bold text-stone-900">Resumen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-stone-600">
            <dt>Productos</dt>
            <dd>{items.reduce((s, i) => s + i.cantidad, 0)} u.</dd>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-2 text-lg font-extrabold text-stone-900">
            <dt>Total</dt>
            <dd>{formatPrecio(total())}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-stone-500">El precio final lo confirma el servidor al crear el pedido.</p>
        <Link
          to="/checkout"
          className="mt-5 block rounded-lg bg-orange-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-700"
        >
          {usuario ? 'Confirmar pedido' : 'Ingresar para confirmar'}
        </Link>
        <Link to="/" className="mt-2 block text-center text-sm font-medium text-stone-600 hover:underline">
          Seguir comprando
        </Link>
      </Card>
    </div>
  )
}
