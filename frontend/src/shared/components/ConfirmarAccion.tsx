import type { ReactNode } from 'react'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'

interface Props {
  titulo: string
  children: ReactNode
  textoConfirmar: string
  cargando: boolean
  error?: string | null
  onConfirmar: () => void
  onClose: () => void
}

/** Diálogo de confirmación para acciones destructivas (bajas lógicas, cancelaciones). */
export function ConfirmarAccion({ titulo, children, textoConfirmar, cargando, error, onConfirmar, onClose }: Props) {
  return (
    <Modal titulo={titulo} onClose={onClose}>
      <div className="text-sm text-stone-600">{children}</div>
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variante="secundario" onClick={onClose}>
          Volver
        </Button>
        <Button variante="peligro" cargando={cargando} onClick={onConfirmar}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  )
}
