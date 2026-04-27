/** Compact star row for ratings (display + optional interactive handled by parent). */
export function Stars({
  value,
  max = 5,
  size = 'sm',
}: {
  value: number
  max?: number
  size?: 'sm' | 'md'
}) {
  const sz = size === 'md' ? 'text-base' : 'text-sm'
  const filled = Math.round(Math.min(max, Math.max(0, value)))
  return (
    <span className={`inline-flex items-center gap-0.5 ${sz}`} title={`${value.toFixed(1)} / ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < filled ? 'text-amber-400' : 'text-white/15'}>
          ★
        </span>
      ))}
    </span>
  )
}
