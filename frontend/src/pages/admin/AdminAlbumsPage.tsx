// Admin view: minimal album CRUD for the challenge.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../state/auth'
import { Link } from 'react-router-dom'
import { useState } from 'react'

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

  if (!user) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="font-semibold text-white">Login required</div>
        <div className="mt-1 text-sm text-slate-300">Admin routes require authentication.</div>
        <div className="h-3" />
        <Link className="rounded-lg border border-sky-400/40 bg-sky-400/15 px-3 py-2 text-sm hover:bg-sky-400/25" to="/login">
          Login
        </Link>
      </div>
    )
  }
  if (!user.is_admin) {
    return <div className="rounded-xl border border-white/10 bg-white/5 p-4">Admin access required.</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Admin · Albums</h1>
      <p className="mb-4 text-slate-300">Create and delete albums (minimal UI).</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm hover:bg-white/15" to="/admin/artists">
          Manage artists
        </Link>
      </div>

      <div className="mb-4 grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="font-semibold text-white">Create album</div>
        <div className="flex flex-wrap gap-2">
          <select
            className="min-w-[220px] rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/40"
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
            className="min-w-[180px] flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            placeholder="Album name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-28 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <button
            className="rounded-lg border border-sky-400/40 bg-sky-400/15 px-3 py-2 text-sm hover:bg-sky-400/25 disabled:opacity-50"
            disabled={artistId === '' || !name || createM.isPending}
            onClick={() => createM.mutate()}
          >
            Create
          </button>
        </div>
      </div>

      {albumsQ.isLoading ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">Loading…</div>
      ) : null}
      {albumsQ.isError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">Failed to load.</div>
      ) : null}

      <div className="grid gap-3">
        {(albumsQ.data ?? []).map((a) => (
          <div key={a.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-semibold text-white">{a.name}</div>
                <div className="text-sm text-slate-300">
                  Artist #{a.artist_id} · ${a.price} · avg {a.rating_avg ? a.rating_avg.toFixed(1) : '—'} ({a.rating_count})
                </div>
              </div>
              <button
                className="rounded-lg border border-red-400/40 bg-red-400/15 px-3 py-2 text-sm hover:bg-red-400/25"
                onClick={() => delM.mutate(a.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

