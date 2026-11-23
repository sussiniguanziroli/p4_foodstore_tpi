import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { Input, primerError, Textarea } from '@/shared/ui/Input'
import { Modal } from '@/shared/ui/Modal'
import type { Categoria, CategoriaInput } from '../types/categoria'

interface Props {
  categoria: Categoria | null // null = alta; con valor = edición
  error: string | null
  onSubmit: (datos: CategoriaInput) => Promise<void>
  onClose: () => void
}

/** Alta y edición de categorías con TanStack Form (nombre de 2 a 100 caracteres, como CategoriaCreate). */
export function CategoriaForm({ categoria, error, onSubmit, onClose }: Props) {
  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? '', descripcion: categoria?.descripcion ?? '' },
    onSubmit: async ({ value }) => {
      await onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null })
    },
  })

  return (
    <Modal titulo={categoria ? `Editar «${categoria.nombre}»` : 'Nueva categoría'} onClose={onClose}>
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
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const largo = value.trim().length
              if (largo < 2) return 'El nombre debe tener al menos 2 caracteres'
              if (largo > 100) return 'El nombre no puede superar los 100 caracteres'
              return undefined
            },
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

        <form.Field name="descripcion">
          {(field) => (
            <Textarea
              id="descripcion"
              label="Descripción (opcional)"
              maxLength={500}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        {/* 409: nombre repetido (también contra categorías dadas de baja) */}
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
