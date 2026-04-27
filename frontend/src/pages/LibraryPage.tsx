// User library: purchased albums + rating (1..5) for owned content only.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import { useAuth } from '../state/auth'
import { Link } from 'react-router-dom'
import { useState } from 'react'

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
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="font-semibold text-white">Login required</div>
            <div className="text-sm text-slate-300">View your purchased albums after logging in.</div>
          </div>
          <Link
            className="rounded-lg border border-sky-400/40 bg-sky-400/15 px-3 py-2 text-sm hover:bg-sky-400/25"
            to="/login"
          >
            Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">My library</h1>
      <p className="mb-4 text-slate-300">Albums you purchased, plus your rating.</p>

      {libQ.isLoading ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">Loading…</div>
      ) : null}
      {libQ.isError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">Failed to load library.</div>
      ) : null}
      {libQ.data && libQ.data.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          No purchases yet. Go to Catalog and purchase an album.
        </div>
      ) : null}

      <div className="grid gap-3">
        {(libQ.data ?? []).map((it) => (
          <div key={it.album.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 font-semibold text-white">{it.album.name}</div>
              <span className="shrink-0 rounded-full border border-white/15 px-2 py-1 text-xs text-slate-200">
                ${it.album.price}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/15 px-2 py-1 text-xs text-slate-200">
                Avg: {it.album.rating_avg ? it.album.rating_avg.toFixed(1) : '—'} ({it.album.rating_count})
              </span>
              <span className="rounded-full border border-white/15 px-2 py-1 text-xs text-slate-200">
                Purchased: {new Date(it.purchased_at).toLocaleString()}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-400">Your rating:</span>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  className={`rounded-lg border px-3 py-2 text-sm disabled:opacity-50 ${
                    it.my_rating?.value === v
                      ? 'border-sky-400/40 bg-sky-400/15 hover:bg-sky-400/25'
                      : 'border-white/15 bg-white/10 hover:bg-white/15'
                  }`}
                  disabled={rateM.isPending && saving === it.album.id}
                  onClick={() => rateM.mutate({ albumId: it.album.id, value: v })}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

