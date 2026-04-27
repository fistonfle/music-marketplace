// User library: purchased albums + rating (1..5) for owned content only.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import { useAuth } from '../state/auth'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AlbumArt } from '../shared/ui/AlbumArt'
import { Stars } from '../shared/ui/Stars'

type Album = {
  id: number
  artist_id: number
  name: string
  price: string
  rating_avg: number | null
  rating_count: number
}

type Rating = {
  album_id: number
  value: number
  updated_at: string
}

type LibraryItem = {
  album: Album
  purchased_at: string
  my_rating: Rating | null
}

export function LibraryPage() {
  const { tokenPair, user } = useAuth()
  const qc = useQueryClient()
  const [saving, setSaving] = useState<number | null>(null)

  const libQ = useQuery({
    queryKey: ['library'],
    enabled: !!tokenPair,
    queryFn: () =>
      apiFetch<LibraryItem[]>('/library', { token: tokenPair!.access_token }),
  })

  const rateM = useMutation({
    mutationFn: ({ albumId, value }: { albumId: number; value: number }) => {
      return apiFetch<Rating>(`/ratings/${albumId}`, {
        method: 'PUT',
        token: tokenPair!.access_token,
        body: JSON.stringify({ value }),
      })
    },
    onMutate: async ({ albumId }) => setSaving(albumId),
    onSettled: async () => {
      setSaving(null)
      await qc.invalidateQueries({ queryKey: ['library'] })
      await qc.invalidateQueries({ queryKey: ['albums'] })
    },
  })

  if (!user) {
    return (
      <div className="card-glass mx-auto max-w-lg p-8 text-center">
        <h1 className="font-display text-2xl font-bold text-white">Your library</h1>
        <p className="mt-2 text-stone-400">Sign in to see purchases and leave ratings.</p>
        <Link className="btn-primary mt-6 inline-flex" to="/login">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">My library</h1>
        <p className="mt-2 max-w-xl text-lg text-stone-400">
          Albums you own — rate each one once to help other listeners.
        </p>
      </header>

      {libQ.isLoading ? (
        <div className="card-glass p-8 text-stone-500">Loading your collection…</div>
      ) : null}
      {libQ.isError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-100">
          Couldn’t load your library.
        </div>
      ) : null}
      {libQ.data && libQ.data.length === 0 ? (
        <div className="card-glass flex flex-col items-center px-8 py-14 text-center">
          <p className="text-stone-400">Your shelf is empty.</p>
          <Link className="btn-primary mt-6" to="/">
            Browse catalog
          </Link>
        </div>
      ) : null}

      <div className="grid gap-4">
        {(libQ.data ?? []).map((it) => (
          <article
            key={it.album.id}
            className="card-glass flex flex-col gap-4 p-5 sm:flex-row sm:items-stretch"
          >
            <AlbumArt albumName={it.album.name} size="lg" className="mx-auto sm:mx-0" />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-bold text-white">{it.album.name}</h2>
                  <p className="text-sm text-stone-500">
                    Purchased {new Date(it.purchased_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                </div>
                <span className="rounded-lg bg-white/10 px-3 py-1 text-sm font-semibold tabular-nums text-fuchsia-200 ring-1 ring-white/10">
                  ${it.album.price}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Community</p>
                  <div className="mt-1 flex items-center gap-2">
                    {it.album.rating_avg != null ? (
                      <>
                        <Stars value={it.album.rating_avg} size="md" />
                        <span className="text-sm text-stone-400">
                          {it.album.rating_avg.toFixed(1)} · {it.album.rating_count} ratings
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-stone-600">No community ratings yet</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-5">
                <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Your rating</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((v) => {
                    const active = it.my_rating?.value === v
                    return (
                      <button
                        key={v}
                        type="button"
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold transition disabled:opacity-40 ${
                          active
                            ? 'border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-100 shadow-lg shadow-fuchsia-950/40'
                            : 'border-white/12 bg-black/30 text-stone-300 hover:border-white/25 hover:bg-white/5'
                        }`}
                        disabled={rateM.isPending && saving === it.album.id}
                        onClick={() => rateM.mutate({ albumId: it.album.id, value: v })}
                        aria-label={`Rate ${v} stars`}
                      >
                        {v}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
