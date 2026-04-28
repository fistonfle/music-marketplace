import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../state/auth'
import { Link } from 'react-router-dom'
import { useState } from 'react'

type Artist = { id: number; performing_name: string }
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
  const [editingId, setEditingId] = useState<number | null>(null)

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
        body: JSON.stringify({ artist_id: artistId, name, price }),
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

  const updateM = useMutation({
    mutationFn: (id: number) =>
      apiFetch<Album>(`/albums/${id}`, {
        method: 'PUT',
        token: tokenPair!.access_token,
        body: JSON.stringify({ artist_id: artistId, name, price }),
      }),
    onSuccess: async () => {
      setEditingId(null)
      setArtistId('')
      setName('')
      setPrice('9.99')
      await qc.invalidateQueries({ queryKey: ['albums'] })
    },
  })

  if (!user) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="font-medium text-white">Login required</div>
        <p className="mt-1 text-sm text-stone-400">Admin routes require authentication.</p>
        <Link className="mt-3 inline-block rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-medium text-white hover:bg-fuchsia-500" to="/login">
          Login
        </Link>
      </div>
    )
  }
  if (!user.is_admin) {
    return <div className="rounded-lg border border-white/10 bg-white/5 p-4">Admin access required.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Admin · Albums</h1>
          <p className="text-sm text-stone-400">Create and delete albums.</p>
        </div>
        <Link className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10" to="/admin/artists">
          ← Manage artists
        </Link>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="font-medium text-white">{editingId ? 'Edit album' : 'Create album'}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            className="min-w-[220px] rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            value={artistId}
            onChange={(e) => setArtistId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">Select artist…</option>
            {(artistsQ.data ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.performing_name}
              </option>
            ))}
          </select>
          <input
            className="min-w-[180px] flex-1 rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="Album name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-28 rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          {editingId ? (
            <>
              <button
                className="rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-medium text-white hover:bg-fuchsia-500 disabled:opacity-50"
                disabled={artistId === '' || !name || updateM.isPending}
                onClick={() => updateM.mutate(editingId)}
              >
                Save
              </button>
              <button
                className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                onClick={() => {
                  setEditingId(null)
                  setArtistId('')
                  setName('')
                  setPrice('9.99')
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-medium text-white hover:bg-fuchsia-500 disabled:opacity-50"
              disabled={artistId === '' || !name || createM.isPending}
              onClick={() => createM.mutate()}
            >
              Create
            </button>
          )}
        </div>
      </div>

      {albumsQ.isLoading ? <div className="rounded-lg border border-white/10 bg-white/5 p-4">Loading…</div> : null}
      {albumsQ.isError ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">Failed to load.</div> : null}

      <div className="grid gap-3">
        {(albumsQ.data ?? []).map((a) => (
          <div key={a.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-medium text-white">{a.name}</div>
                <div className="text-sm text-stone-400">
                  Artist #{a.artist_id} · ${a.price}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                  onClick={() => {
                    setEditingId(a.id)
                    setArtistId(a.artist_id)
                    setName(a.name)
                    setPrice(a.price)
                  }}
                >
                  Edit
                </button>
                <button
                  className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-100 hover:bg-red-500/20"
                  onClick={() => delM.mutate(a.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

