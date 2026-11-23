import { useForm } from '@tanstack/react-form'
import { Button } from '@/shared/ui/Button'
import { Input, primerError } from '@/shared/ui/Input'

interface Props {
  onSubmit: (username: string, password: string) => Promise<void>
  error: string | null
}

export function LoginForm({ onSubmit, error }: Props) {
  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      await onSubmit(value.username.trim(), value.password)
    },
  })

  return (
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
        name="username"
        validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu nombre de usuario') }}
      >
        {(field) => (
          <Input
            id="username"
            label="Usuario"
            autoComplete="username"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña') }}
      >
        {(field) => (
          <Input
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="current-password"
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

      {/* isSubmitting deshabilita el botón mientras se espera la respuesta: evita el doble envío */}
      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
            {isSubmitting ? 'Ingresando' : 'Ingresar'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
