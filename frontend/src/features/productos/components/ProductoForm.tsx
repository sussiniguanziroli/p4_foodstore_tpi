import { useForm } from '@tanstack/react-form'
import type { Categoria } from '@/features/categorias'
import { Button } from '@/shared/ui/Button'
import { Input, primerError, Select, Textarea } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import type { Producto, ProductoInput } from '../types/producto'

interface Props {
  producto: Producto | null // null = alta
  categorias: Categoria[]
  error: string | null
  onSubmit: (datos: ProductoInput) => Promise<void>
  onClose: () => void
}

const esEnteroNoNegativo = (v: string) => /^\d+$/.test(v.trim())
const esNumeroNoNegativo = (v: string) => v.trim() !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0

/**
 * Alta y edición de productos con TanStack Form. Los números se editan como texto y se
 * convierten al enviar. Las reglas coinciden con ProductoCreate (precio_base >= 0, stock >= 0).
 */
export function ProductoForm({ producto, categorias, error, onSubmit, onClose }: Props) {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto ? String(producto.precio_base) : '',
      imagen_url: producto?.imagen_url ?? '',
      stock: producto ? String(producto.stock) : '0',
      disponible: producto?.disponible ?? true,
      categoria_id: producto ? String(producto.categoria_id) : '',
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      })
    },
  })

  return (
    <Modal titulo={producto ? `Editar «${producto.nombre}»` : 'Nuevo producto'} onClose={onClose} ancho="lg">
      <form
        noValidate
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <div className="sm:col-span-2">
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2
                  ? 'El nombre debe tener al menos 2 caracteres'
                  : value.trim().length > 150
                    ? 'Máximo 150 caracteres'
                    : undefined,
            }}
          >
            {(field) => (
              <Input
                id="nombre"
                label="Nombre"
                autoFocus
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta)}
              />
            )}
          </form.Field>
        </div>

        <form.Field
          name="categoria_id"
          validators={{ onChange: ({ value }) => (value ? undefined : 'Elegí una categoría') }}
        >
          {(field) => (
            <Select
              id="categoria_id"
              label="Categoría"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={primerError(field.state.meta)}
            >
              <option value="">Elegí una categoría…</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          )}
        </form.Field>

        <form.Field
          name="precio_base"
          validators={{ onChange: ({ value }) => (esNumeroNoNegativo(value) ? undefined : 'Ingresá un precio de 0 o más') }}
        >
          {(field) => (
            <Input
              id="precio_base"
              label="Precio base ($)"
              type="number"
              min="0"
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={primerError(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field
          name="stock"
          validators={{ onChange: ({ value }) => (esEnteroNoNegativo(value) ? undefined : 'El stock es un entero de 0 o más') }}
        >
          {(field) => (
            <Input
              id="stock"
              label="Stock"
              type="number"
              min="0"
              step="1"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={primerError(field.state.meta)}
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-stone-700">
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

        <div className="sm:col-span-2">
          <form.Field
            name="imagen_url"
            validators={{
              onChange: ({ value }) =>
                value.trim() === '' || /^https?:\/\//.test(value.trim()) ? undefined : 'La URL debe empezar con http:// o https://',
            }}
          >
            {(field) => (
              <Input
                id="imagen_url"
                label="URL de la imagen (opcional)"
                placeholder="https://…"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta)}
              />
            )}
          </form.Field>
        </div>

        <div className="sm:col-span-2">
          <form.Field name="descripcion">
            {(field) => (
              <Textarea
                id="descripcion"
                label="Descripción (opcional)"
                maxLength={1000}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 sm:col-span-2">
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
