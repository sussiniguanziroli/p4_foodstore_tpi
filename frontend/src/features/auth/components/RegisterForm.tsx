import { useForm } from '@tanstack/react-form'
import type { UsuarioCreate } from '@/features/usuarios'
import { Button } from '@/shared/ui/Button'
import { Input, primerError } from '@/shared/ui/Input'

interface Props {
  onSubmit: (datos: UsuarioCreate) => Promise<void>
  error: string | null
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME = /^[A-Za-z0-9._-]{3,50}$/

// Las mismas reglas que valida el backend (UserCreate); el backend sigue siendo la autoridad
export function RegisterForm({ onSubmit, error }: Props) {
  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmacion: '' },
    onSubmit: async ({ value }) => {
      await onSubmit({
        username: value.username.trim(),
        full_name: value.full_name.trim(),
        email: value.email.trim(),
        password: value.password,
      })
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
        validators={{
          onChange: ({ value }) =>
            USERNAME.test(value.trim()) ? undefined : 'Entre 3 y 50 caracteres: letras, números, punto, guion o guion bajo',
        }}
      >
        {(field) => (
          <Input
            id="username"
            label="Nombre de usuario"
            autoComplete="username"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta)}
            ayuda="Con este nombre vas a iniciar sesión"
          />
        )}
      </form.Field>

      <form.Field
        name="full_name"
        validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu nombre y apellido') }}
      >
        {(field) => (
          <Input
            id="full_name"
            label="Nombre y apellido"
            autoComplete="name"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field
        name="email"
        validators={{ onChange: ({ value }) => (EMAIL.test(value.trim()) ? undefined : 'Ingresá un email válido') }}
      >
        {(field) => (
          <Input
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: ({ value }) =>
            value.length < 8
              ? 'Mínimo 8 caracteres'
              : new TextEncoder().encode(value).length > 72
                ? 'Máximo 72 caracteres'
                : undefined,
        }}
      >
        {(field) => (
          <Input
            id="password"
            label="Contraseña"
            type="password"
            autoComplete="new-password"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field
        name="confirmacion"
        validators={{
          // onChangeListenTo: se vuelve a validar también cuando cambia la contraseña
          onChangeListenTo: ['password'],
          onChange: ({ value, fieldApi }) =>
            value === fieldApi.form.getFieldValue('password') ? undefined : 'Las contraseñas no coinciden',
        }}
      >
        {(field) => (
          <Input
            id="confirmacion"
            label="Repetí la contraseña"
            type="password"
            autoComplete="new-password"
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
            {isSubmitting ? 'Creando cuenta' : 'Crear cuenta'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
