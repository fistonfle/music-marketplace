// Public marketplace view (search + purchase CTA for authenticated users).
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api/client'
import { useAuth } from '../state/auth'
import { Link } from 'react-router-dom'
import { AlbumArt } from '../shared/ui/AlbumArt'
import { Stars } from '../shared/ui/Stars'

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
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-linear-to-br from-stone-900/90 via-stone-950 to-black p-8 shadow-2xl shadow-black/50 sm:p-10">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-600/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-96 rounded-full bg-rose-600/15 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-sm font-medium uppercase tracking-widest text-fuchsia-400/90">New & catalog</p>
          <h1 className="font-display mt-2 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Discover albums. <span className="text-gradient">Own them once.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone-400">
            Stream-quality artwork, fair pricing, and ratings from people who actually bought the record.
          </p>
          <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search</span>
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="input-field !py-3.5 !pl-12"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search artists or albums…"
              />
            </label>
            {!user ? (
              <Link className="btn-primary shrink-0 justify-center text-center sm:w-auto" to="/login">
                Sign in to buy
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-white">Albums</h2>
            <span className="text-sm text-stone-500">
              {(albumsQ.data?.length ?? 0) === 1 ? '1 release' : `${albumsQ.data?.length ?? 0} releases`}
            </span>
          </div>

          {albumsQ.isLoading ? (
            <div className="card-glass grid gap-4 p-8 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex animate-pulse gap-4 rounded-xl bg-white/[0.03] p-4">
                  <div className="h-24 w-24 rounded-xl bg-white/10" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-3/4 rounded bg-white/10" />
                    <div className="h-3 w-1/2 rounded bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {albumsQ.isError ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-100">
              Couldn’t load albums. Try again later.
            </div>
          ) : null}
          {albumsQ.data && albumsQ.data.length === 0 ? (
            <div className="card-glass px-6 py-12 text-center text-stone-400">No albums match your search.</div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {(albumsQ.data ?? []).map((al) => {
              const artist = artistMap.get(al.artist_id)
              const artistName = artist?.performing_name ?? 'Unknown artist'
              return (
                <article
                  key={al.id}
                  className="group card-glass flex gap-4 p-4 transition hover:border-fuchsia-500/20 hover:shadow-lg hover:shadow-fuchsia-950/30"
                >
                  <AlbumArt albumName={al.name} artistName={artistName} size="md" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-white">{al.name}</h3>
                        <p className="truncate text-sm text-stone-400">{artistName}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-fuchsia-200 ring-1 ring-white/10">
                        ${al.price}
                      </span>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                      <div className="flex flex-col gap-1">
                        {al.rating_avg != null ? (
                          <>
                            <Stars value={al.rating_avg} size="sm" />
                            <span className="text-xs text-stone-500">
                              {al.rating_avg.toFixed(1)} avg · {al.rating_count}{' '}
                              {al.rating_count === 1 ? 'review' : 'reviews'}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-stone-600">No ratings yet</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn-primary !px-4 !py-2 text-xs disabled:opacity-40"
                        disabled={!tokenPair || purchaseM.isPending}
                        onClick={() => purchaseM.mutate(al.id)}
                        title={!tokenPair ? 'Sign in required' : 'Add to library'}
                      >
                        {purchaseM.isPending ? '…' : 'Buy'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <aside className="w-full shrink-0 space-y-6 lg:max-w-xs">
          <div className="card-glass p-6">
            <h3 className="font-display text-lg font-bold text-white">Artists</h3>
            <p className="mt-1 text-sm text-stone-500">Spotlight roster</p>
            <div className="mt-5 space-y-3">
              {artistsQ.isLoading ? (
                <p className="text-sm text-stone-500">Loading…</p>
              ) : null}
              {artistsQ.isError ? (
                <p className="text-sm text-red-300">Couldn’t load artists.</p>
              ) : null}
              {(artistsQ.data ?? []).slice(0, 12).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5 transition hover:border-white/10"
                >
                  <AlbumArt albumName={a.performing_name} artistName={a.real_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-stone-200">{a.performing_name}</div>
                    <div className="truncate text-xs text-stone-500">{a.real_name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <details className="card-glass overflow-hidden open:ring-1 open:ring-fuchsia-500/20">
            <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-stone-400 transition hover:text-stone-200">
              Demo accounts
            </summary>
            <div className="border-t border-white/[0.06] px-6 pb-5 pt-2 text-sm leading-relaxed text-stone-500">
              <p>
                <span className="text-stone-400">Admin:</span>{' '}
                <code className="rounded bg-black/40 px-1.5 py-0.5 text-stone-300">admin@example.com</code> /{' '}
                <code className="rounded bg-black/40 px-1.5 py-0.5 text-stone-300">admin123</code>
              </p>
              <p className="mt-2">
                <span className="text-stone-400">User:</span>{' '}
                <code className="rounded bg-black/40 px-1.5 py-0.5 text-stone-300">user@example.com</code> /{' '}
                <code className="rounded bg-black/40 px-1.5 py-0.5 text-stone-300">user123</code>
              </p>
            </div>
          </details>
        </aside>
      </div>
    </div>
  )
}
