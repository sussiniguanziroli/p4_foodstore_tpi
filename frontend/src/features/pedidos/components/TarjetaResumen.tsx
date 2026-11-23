interface Props {
  titulo: string
  valor: string | number
  detalle?: string
  acento: 'amber' | 'sky' | 'emerald' | 'stone' | 'orange' | 'violet'
}

const ACENTOS: Record<Props['acento'], string> = {
  amber: 'from-amber-400 to-amber-500',
  sky: 'from-sky-400 to-sky-500',
  emerald: 'from-emerald-400 to-emerald-500',
  stone: 'from-stone-400 to-stone-500',
  orange: 'from-orange-500 to-orange-600',
  violet: 'from-violet-400 to-violet-500',
}

/** Tarjeta de un indicador del resumen del panel. */
export function TarjetaResumen({ titulo, valor, detalle, acento }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className={`h-1.5 bg-gradient-to-r ${ACENTOS[acento]}`} />
      <div className="p-5">
        <p className="text-sm font-medium text-stone-500">{titulo}</p>
        <p className="mt-2 text-3xl font-black tracking-tight text-stone-900">{valor}</p>
        {detalle && <p className="mt-1 text-xs text-stone-500">{detalle}</p>}
      </div>
    </div>
  )
}
