import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { Input, primerError, Textarea } from '@/shared/ui/Input'
import { FORMAS_PAGO, type FormaPago } from '../types/pedido'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string | null
}

interface Props {
  onSubmit: (datos: DatosCheckout) => Promise<void>
  error: string | null
}

const TEXTO_PAGO: Record<FormaPago, { titulo: string; detalle: string }> = {
  EFECTIVO: { titulo: 'Efectivo', detalle: 'Pagás al recibir el pedido' },
  TRANSFERENCIA: { titulo: 'Transferencia', detalle: 'Te pasamos los datos al confirmar' },
}

/** Formulario de checkout con TanStack Form. Valida lo mismo que PedidoCreate (RN-06). */
export function CheckoutForm({ onSubmit, error }: Props) {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: async ({ value }) => {
      await onSubmit({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim() || null,
      })
    },
  })

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 5) return 'La dirección debe tener al menos 5 caracteres'
            if (largo > 200) return 'La dirección no puede superar los 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            id="direccion_entrega"
            label="Dirección de entrega"
            placeholder="Calle, número, piso, ciudad"
            autoComplete="street-address"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-stone-700">Forma de pago</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {FORMAS_PAGO.map((forma) => (
                <label
                  key={forma}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    field.state.value === forma ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="forma_pago"
                    value={forma}
                    checked={field.state.value === forma}
                    onChange={() => field.handleChange(forma)}
                    className="mt-1 accent-orange-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-stone-900">{TEXTO_PAGO[forma].titulo}</span>
                    <span className="text-xs text-stone-500">{TEXTO_PAGO[forma].detalle}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? 'Máximo 500 caracteres' : undefined) }}
      >
        {(field) => (
          <Textarea
            id="notas"
            label="Notas (opcional)"
            placeholder="Ej.: tocar timbre B, sin cebolla…"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta)}
          />
        )}
      </form.Field>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
            {isSubmitting ? 'Confirmando pedido' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
