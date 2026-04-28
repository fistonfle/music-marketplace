import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, apiFetch } from '../../api/client'
import { useAuth } from '../../state/auth'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlbumArt } from '../../shared/ui/AlbumArt'
import { Stars } from '../../shared/ui/Stars'

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

type LibraryItem = {
  album: { id: number }
}

export function CatalogPage() {
  const qc = useQueryClient()
  const { tokenPair, user } = useAuth()
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const loc = useLocation()

  const artistsQ = useQuery({
    queryKey: ['artists', q],
    queryFn: () => apiFetch<Artist[]>(`/artists${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  })
  const albumsQ = useQuery({
    queryKey: ['albums', q],
    queryFn: () => apiFetch<Album[]>(`/albums${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  })

  // Used to disable "Buy" for albums already purchased.
  const libraryQ = useQuery({
    queryKey: ['library'],
    enabled: !!tokenPair,
    queryFn: () => apiFetch<LibraryItem[]>('/library', { token: tokenPair!.access_token }),
  })

  const purchaseM = useMutation({
    mutationFn: (albumId: number) => {
      if (!tokenPair) throw new Error('Not authenticated')
      return apiFetch(`/purchases/${albumId}`, { method: 'POST', token: tokenPair.access_token })
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['library'] })
    },
    onError: async (err) => {
      // If we tried to buy something already owned, refresh the library so the UI flips to "Owned".
      if (err instanceof ApiError && err.status === 400) {
        await qc.invalidateQueries({ queryKey: ['library'] })
      }
    },
  })

  const artistMap = useMemo(() => {
    const m = new Map<number, Artist>()
    for (const a of artistsQ.data ?? []) m.set(a.id, a)
    return m
  }, [artistsQ.data])

  const ownedAlbumIds = useMemo(() => {
    const s = new Set<number>()
    for (const it of libraryQ.data ?? []) s.add(it.album.id)
    return s
  }, [libraryQ.data])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Catalog</h1>
          <p className="text-sm text-stone-400">Browse albums, purchase once, and rate what you own.</p>
        </div>
        {!user ? (
          <Link className="text-sm text-fuchsia-300 hover:text-fuchsia-200" to="/login">
            Login →
          </Link>
        ) : null}
      </div>

      <input
        className="w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search albums…"
      />

      {albumsQ.isLoading ? <div className="rounded-lg border border-white/10 bg-white/5 p-4">Loading…</div> : null}
      {albumsQ.isError ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">Failed to load.</div> : null}
      {albumsQ.data && albumsQ.data.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">No albums found.</div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {(albumsQ.data ?? []).map((al) => {
          const artistName = artistMap.get(al.artist_id)?.performing_name ?? '—'
          const owned = ownedAlbumIds.has(al.id)
          return (
            <div key={al.id} className="flex gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
              <AlbumArt albumName={al.name} artistName={artistName} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{al.name}</div>
                    <div className="truncate text-sm text-stone-400">{artistName}</div>
                  </div>
                  <span className="shrink-0 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-stone-200">
                    ${al.price}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  {al.rating_avg != null ? (
                    <div className="flex flex-col">
                      <Stars value={al.rating_avg} />
                      <span className="text-xs text-stone-500">
                        {al.rating_avg.toFixed(1)} · {al.rating_count}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-stone-500">No ratings</span>
                  )}
                  <button
                    className="rounded-md bg-fuchsia-600 px-3 py-2 text-xs font-medium text-white hover:bg-fuchsia-500 disabled:opacity-50"
                    disabled={purchaseM.isPending || owned}
                    onClick={() => {
                      if (!tokenPair) {
                        nav('/login', { state: { from: loc.pathname + loc.search } })
                        return
                      }
                      purchaseM.mutate(al.id)
                    }}
                  >
                    {owned ? 'Owned' : 'Buy'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="font-medium text-white">Artists</div>
        <div className="mt-2 grid gap-2 text-sm">
          {(artistsQ.data ?? []).slice(0, 10).map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2">
              <span className="truncate text-stone-200">{a.performing_name}</span>
              <span className="shrink-0 text-xs text-stone-500">{a.real_name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

