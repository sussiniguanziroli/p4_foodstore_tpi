import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { Input, primerError } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import type { Producto, ProductoStockUpdate } from '../types/producto'

interface Props {
  producto: Producto
  error: string | null
  onSubmit: (datos: ProductoStockUpdate) => Promise<void>
  onClose: () => void
}

/** Cambio rápido de stock y disponibilidad: PATCH /productos/{id}/stock. */
export function StockForm({ producto, error, onSubmit, onClose }: Props) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      await onSubmit({ stock: Number(value.stock), disponible: value.disponible })
    },
  })

  return (
    <Modal titulo={`Stock de «${producto.nombre}»`} onClose={onClose}>
      <form
        noValidate
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="stock"
          validators={{ onChange: ({ value }) => (/^\d+$/.test(value.trim()) ? undefined : 'El stock es un entero de 0 o más') }}
        >
          {(field) => (
            <Input
              id="stock"
              label="Unidades en stock"
              type="number"
              min="0"
              step="1"
              autoFocus
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={primerError(field.state.meta)}
              ayuda="Los pedidos descuentan stock al crearse y lo devuelven al cancelarse."
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 accent-orange-600"
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={onClose}>
            Cancelar
          </Button>
          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit} cargando={isSubmitting}>
                Guardar
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  )
}
