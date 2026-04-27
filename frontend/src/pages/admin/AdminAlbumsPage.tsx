// Admin view: minimal album CRUD for the challenge.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../state/auth'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AlbumArt } from '../../shared/ui/AlbumArt'
import { Stars } from '../../shared/ui/Stars'

type Artist = {
  id: number
  performing_name: string
}

type Album = {
  id: number
  artist_id: number
  name: string
  price: string
  rating_avg: number | null
  rating_count: number
}

export function AdminAlbumsPage() {
  const { user, tokenPair } = useAuth()
  const qc = useQueryClient()
  const [artistId, setArtistId] = useState<number | ''>('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('9.99')

  const artistsQ = useQuery({
    queryKey: ['artists', 'admin-picker'],
    enabled: !!tokenPair && !!user?.is_admin,
    queryFn: () => apiFetch<Artist[]>('/artists'),
  })

  const albumsQ = useQuery({
    queryKey: ['albums', 'admin'],
    enabled: !!tokenPair && !!user?.is_admin,
    queryFn: () => apiFetch<Album[]>('/albums'),
  })

  const createM = useMutation({
    mutationFn: () =>
      apiFetch<Album>('/albums', {
        method: 'POST',
        token: tokenPair!.access_token,
        body: JSON.stringify({
          artist_id: artistId,
          name,
          price,
        }),
      }),
    onSuccess: async () => {
      setName('')
      await qc.invalidateQueries({ queryKey: ['albums'] })
    },
  })

  const delM = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/albums/${id}`, { method: 'DELETE', token: tokenPair!.access_token }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['albums'] })
    },
  })

  const artistMap = new Map((artistsQ.data ?? []).map((a) => [a.id, a]))

  if (!user) {
    return (
      <div className="card-glass max-w-lg p-8">
        <h1 className="font-display text-xl font-bold text-white">Admin</h1>
        <p className="mt-2 text-sm text-stone-400">Sign in as admin to manage albums.</p>
        <Link className="btn-primary mt-6 inline-flex" to="/login">
          Sign in
        </Link>
      </div>
    )
  }
  if (!user.is_admin) {
    return (
      <div className="card-glass max-w-lg p-8 text-stone-300">
        You don’t have admin access.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-fuchsia-400/90">Admin</p>
          <h1 className="font-display text-3xl font-bold text-white">Albums</h1>
          <p className="mt-1 text-stone-400">Attach releases to artists and set pricing.</p>
        </div>
        <Link className="btn-secondary shrink-0 self-start sm:self-auto" to="/admin/artists">
          ← Artists
        </Link>
      </header>

      <section className="card-glass p-6">
        <h2 className="font-semibold text-white">New album</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            className="input-field max-w-xs flex-1 min-w-[200px]"
            value={artistId}
            onChange={(e) =>
              setArtistId(e.target.value ? Number(e.target.value) : '')
            }
          >
            <option value="">Select artist…</option>
            {(artistsQ.data ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.performing_name}
              </option>
            ))}
          </select>
          <input
            className="input-field max-w-xs flex-1 min-w-[160px]"
            placeholder="Album title"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input-field w-28"
            placeholder="9.99"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <button
            type="button"
            className="btn-primary"
            disabled={artistId === '' || !name || createM.isPending}
            onClick={() => createM.mutate()}
          >
            Add album
          </button>
        </div>
      </section>

      {albumsQ.isLoading ? (
        <div className="card-glass p-8 text-stone-500">Loading…</div>
      ) : null}
      {albumsQ.isError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-100">
          Failed to load albums.
        </div>
      ) : null}

      <div className="grid gap-3">
        {(albumsQ.data ?? []).map((a) => {
          const artist = artistMap.get(a.artist_id)
          return (
            <div key={a.id} className="card-glass flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <AlbumArt albumName={a.name} artistName={artist?.performing_name} size="md" />
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">{a.name}</div>
                  <div className="truncate text-sm text-stone-500">{artist?.performing_name ?? `Artist #${a.artist_id}`}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-stone-500">
                    <span className="rounded-lg bg-white/10 px-2 py-0.5 font-medium text-fuchsia-200">${a.price}</span>
                    {a.rating_avg != null ? (
                      <span className="flex items-center gap-2">
                        <Stars value={a.rating_avg} />
                        ({a.rating_count})
                      </span>
                    ) : (
                      <span>no ratings</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="rounded-xl border border-red-400/35 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-500/20"
                onClick={() => delM.mutate(a.id)}
              >
                Delete
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
