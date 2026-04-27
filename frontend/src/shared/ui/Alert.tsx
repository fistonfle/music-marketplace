export function Alert({ title, description }: { title: string; description?: string }) {
  return (
    <div
      className="rounded-xl border border-red-500/30 bg-red-500/10 p-4"
      role="alert"
      aria-live="polite"
    >
      <div className="font-semibold text-red-100">{title}</div>
      {description ? <div className="mt-1 text-sm text-red-100/80">{description}</div> : null}
    </div>
  )
}

