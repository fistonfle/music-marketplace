// Admin view: minimal artist CRUD for the challenge.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../state/auth'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AlbumArt } from '../../shared/ui/AlbumArt'

type Artist = {
  id: number
  real_name: string
  performing_name: string
  date_of_birth: string
}

export function AdminArtistsPage() {
  const { user, tokenPair } = useAuth()
  const qc = useQueryClient()
  const [realName, setRealName] = useState('')
  const [performingName, setPerformingName] = useState('')
  const [dob, setDob] = useState('1990-01-01')

  const artistsQ = useQuery({
    queryKey: ['artists', 'admin'],
    enabled: !!tokenPair && !!user?.is_admin,
    queryFn: () => apiFetch<Artist[]>('/artists'),
  })

  const createM = useMutation({
    mutationFn: () =>
      apiFetch<Artist>('/artists', {
        method: 'POST',
        token: tokenPair!.access_token,
        body: JSON.stringify({
          real_name: realName,
          performing_name: performingName,
          date_of_birth: dob,
        }),
      }),
    onSuccess: async () => {
      setRealName('')
      setPerformingName('')
      await qc.invalidateQueries({ queryKey: ['artists'] })
    },
  })

  const delM = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/artists/${id}`, { method: 'DELETE', token: tokenPair!.access_token }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['artists'] })
    },
  })

  if (!user) {
    return (
      <div className="card-glass max-w-lg p-8">
        <h1 className="font-display text-xl font-bold text-white">Admin</h1>
        <p className="mt-2 text-sm text-stone-400">Sign in as admin to manage artists.</p>
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
          <h1 className="font-display text-3xl font-bold text-white">Artists</h1>
          <p className="mt-1 text-stone-400">Create and remove performers from the catalog.</p>
        </div>
        <Link className="btn-secondary shrink-0 self-start sm:self-auto" to="/admin/albums">
          Manage albums →
        </Link>
      </header>

      <section className="card-glass p-6">
        <h2 className="font-semibold text-white">New artist</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            className="input-field max-w-xs flex-1 min-w-[160px]"
            placeholder="Legal name"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
          />
          <input
            className="input-field max-w-xs flex-1 min-w-[160px]"
            placeholder="Stage name"
            value={performingName}
            onChange={(e) => setPerformingName(e.target.value)}
          />
          <input
            className="input-field w-auto min-w-[140px]"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          <button
            type="button"
            className="btn-primary"
            disabled={!realName || !performingName || createM.isPending}
            onClick={() => createM.mutate()}
          >
            Add artist
          </button>
        </div>
      </section>

      {artistsQ.isLoading ? (
        <div className="card-glass p-8 text-stone-500">Loading…</div>
      ) : null}
      {artistsQ.isError ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-100">
          Failed to load artists.
        </div>
      ) : null}

      <div className="grid gap-3">
        {(artistsQ.data ?? []).map((a) => (
          <div key={a.id} className="card-glass flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <AlbumArt albumName={a.performing_name} artistName={a.real_name} size="md" />
              <div>
                <div className="font-semibold text-white">{a.performing_name}</div>
                <div className="text-sm text-stone-500">
                  {a.real_name} · born {a.date_of_birth}
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
        ))}
      </div>
    </div>
  )
}
