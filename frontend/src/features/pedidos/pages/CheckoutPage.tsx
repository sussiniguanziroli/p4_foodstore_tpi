import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { handleApiError } from '@/shared/api/handleApiError'
import { Card } from '@/shared/ui/Card'
import { formatPrecio } from '@/shared/utils/formato'
import { useCartStore } from '@/store/cartStore'
import { CheckoutForm, type DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/useCrearPedido'

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total)
  const vaciar = useCartStore((s) => s.vaciar)
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  // Sin ítems se vuelve al carrito, salvo que el carrito se haya vaciado porque el pedido se acaba de crear
  if (items.length === 0 && !crearPedido.isSuccess) return <Navigate to="/carrito" replace />

  async function confirmar(datos: DatosCheckout) {
    setError(null)
    try {
      // Solo viajan producto y cantidad: precios, subtotales y total los calcula el backend (RN-01)
      await crearPedido.mutateAsync({
        ...datos,
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      })
      vaciar()
      navigate('/mis-pedidos', { replace: true, state: { creado: true } })
    } catch (e) {
      // 400: stock insuficiente, no disponible o repetido · 404: producto dado de baja
      setError(handleApiError(e, 'No se pudo confirmar el pedido'))
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <Card className="p-6">
        <h1 className="text-2xl font-extrabold text-stone-900">Confirmar pedido</h1>
        <p className="mb-6 mt-1 text-sm text-stone-500">Indicá dónde lo llevamos y cómo vas a pagar.</p>
        <CheckoutForm onSubmit={confirmar} error={error} />
      </Card>

      <Card className="h-fit p-6">
        <h2 className="font-bold text-stone-900">Tu pedido</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between gap-3">
              <span className="text-stone-700">
                {i.cantidad} × {i.nombre}
              </span>
              <span className="font-medium">{formatPrecio(i.precio_unitario * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-stone-200 pt-3 text-lg font-extrabold">
          <span>Total</span>
          <span>{formatPrecio(total())}</span>
        </div>
        <Link to="/carrito" className="mt-4 block text-center text-sm font-medium text-stone-600 hover:underline">
          Volver al carrito
        </Link>
      </Card>
    </div>
  )
}
