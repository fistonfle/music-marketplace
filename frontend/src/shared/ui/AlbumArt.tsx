/** Deterministic gradient “cover art” from album + artist names. */
function seedFrom(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i)
  return Math.abs(h)
}

type Props = {
  albumName: string
  artistName?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeCls = {
  sm: 'h-14 w-14 min-h-14 min-w-14 text-lg',
  md: 'h-24 w-24 min-h-24 min-w-24 text-2xl',
  lg: 'h-36 w-36 min-h-36 min-w-36 text-4xl',
}

export function AlbumArt({ albumName, artistName = '', size = 'md', className = '' }: Props) {
  const seed = seedFrom(albumName + artistName)
  const h1 = seed % 360
  const h2 = (seed * 17) % 360
  const h3 = (seed * 31) % 360
  const initials = albumName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '♪'

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/20 font-semibold tracking-tight text-white shadow-inner ring-1 ring-white/10 ${sizeCls[size]} ${className}`}
      style={{
        background: `
          radial-gradient(ellipse 80% 80% at 30% 20%, hsl(${h1} 85% 55% / 0.35), transparent 55%),
          radial-gradient(ellipse 70% 70% at 80% 80%, hsl(${h2} 75% 45% / 0.4), transparent 50%),
          linear-gradient(145deg, hsl(${h1} 55% 28%), hsl(${h3} 50% 18%))
        `,
      }}
      aria-hidden
    >
      <span className="relative z-[1] drop-shadow-md">{initials}</span>
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
