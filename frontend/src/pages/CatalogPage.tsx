// Public marketplace view (search + purchase CTA for authenticated users).
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import { useAuth } from '../state/auth'
import { Link } from 'react-router-dom'

type Artist = {
  id: number
  real_name: string
  performing_name: string
  date_of_birth: string
}

type Album = {
  id: number
  artist_id: number
  name: string
  price: string
  rating_avg: number | null
  rating_count: number
}

export function CatalogPage() {
  const qc = useQueryClient()
  const { tokenPair, user } = useAuth()
  const [q, setQ] = useState('')

  const artistsQ = useQuery({
    queryKey: ['artists', q],
    queryFn: () =>
      apiFetch<Artist[]>(`/artists${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  })
  const albumsQ = useQuery({
    queryKey: ['albums', q],
    queryFn: () =>
      apiFetch<Album[]>(`/albums${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  })

  const purchaseM = useMutation({
    mutationFn: (albumId: number) => {
      if (!tokenPair) throw new Error('Not authenticated')
      return apiFetch(`/purchases/${albumId}`, { method: 'POST', token: tokenPair.access_token })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['library'] })
    },
  })

  const artistMap = useMemo(() => {
    const m = new Map<number, Artist>()
    for (const a of artistsQ.data ?? []) m.set(a.id, a)
    return m
  }, [artistsQ.data])

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-white">Catalog</h1>
        <p className="mb-4 text-slate-300">Browse artists and albums. Login to purchase and rate.</p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            className="min-w-[220px] flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search artists or albums…"
          />
          {!user ? (
            <Link
              className="rounded-lg border border-sky-400/40 bg-sky-400/15 px-3 py-2 text-sm hover:bg-sky-400/25"
              to="/login"
            >
              Login
            </Link>
          ) : null}
        </div>

        {albumsQ.isLoading ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">Loading albums…</div>
        ) : null}
        {albumsQ.isError ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">Failed to load albums.</div>
        ) : null}
        {albumsQ.data && albumsQ.data.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">No albums found.</div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(albumsQ.data ?? []).map((al) => {
            const artist = artistMap.get(al.artist_id)
            return (
              <div key={al.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-white">{al.name}</div>
                    <div className="mt-1 text-sm text-slate-300">
                      {artist ? artist.performing_name : '—'}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/15 px-2 py-1 text-xs text-slate-200">
                    ${al.price}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-white/15 px-2 py-1 text-xs text-slate-200">
                    {al.rating_avg ? al.rating_avg.toFixed(1) : '—'} ({al.rating_count})
                  </span>
                  <button
                    className="rounded-lg border border-sky-400/40 bg-sky-400/15 px-3 py-2 text-sm hover:bg-sky-400/25 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!tokenPair || purchaseM.isPending}
                    onClick={() => purchaseM.mutate(al.id)}
                    title={!tokenPair ? 'Login required' : 'Purchase'}
                  >
                    Purchase
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="font-semibold text-white">Artists</div>
          <div className="h-2" />
          {artistsQ.isLoading ? <div className="text-sm text-slate-300">Loading…</div> : null}
          {artistsQ.isError ? <div className="text-sm text-red-200">Failed to load.</div> : null}
          {artistsQ.data && artistsQ.data.length === 0 ? (
            <div className="text-sm text-slate-300">No artists found.</div>
          ) : null}
          <div className="mt-2 grid gap-2">
            {(artistsQ.data ?? []).slice(0, 10).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-slate-200">{a.performing_name}</span>
                <span className="shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-xs text-slate-200">
                  {a.real_name}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="font-semibold text-white">Seeded accounts</div>
          <div className="h-2" />
          <div className="text-sm text-slate-300">
            Admin: <code className="text-slate-100">admin@example.com</code> /{' '}
            <code className="text-slate-100">admin123</code>
            <br />
            User: <code className="text-slate-100">user@example.com</code> / <code className="text-slate-100">user123</code>
          </div>
        </div>
      </div>
    </div>
  )
}

