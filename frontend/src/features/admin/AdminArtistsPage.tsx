import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../state/auth'
import { Link } from 'react-router-dom'
import { useState } from 'react'

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
  const [editingId, setEditingId] = useState<number | null>(null)

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

  const updateM = useMutation({
    mutationFn: (id: number) =>
      apiFetch<Artist>(`/artists/${id}`, {
        method: 'PUT',
        token: tokenPair!.access_token,
        body: JSON.stringify({
          real_name: realName,
          performing_name: performingName,
          date_of_birth: dob,
        }),
      }),
    onSuccess: async () => {
      setEditingId(null)
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
          <h1 className="text-2xl font-semibold text-white">Admin · Artists</h1>
          <p className="text-sm text-stone-400">Create and delete artists.</p>
        </div>
        <Link className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10" to="/admin/albums">
          Manage albums →
        </Link>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="font-medium text-white">{editingId ? 'Edit artist' : 'Create artist'}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="min-w-[180px] flex-1 rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="Real name"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
          />
          <input
            className="min-w-[180px] flex-1 rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            placeholder="Performing name"
            value={performingName}
            onChange={(e) => setPerformingName(e.target.value)}
          />
          <input
            className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
          {editingId ? (
            <>
              <button
                className="rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-medium text-white hover:bg-fuchsia-500 disabled:opacity-50"
                disabled={!realName || !performingName || updateM.isPending}
                onClick={() => updateM.mutate(editingId)}
              >
                Save
              </button>
              <button
                className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                onClick={() => {
                  setEditingId(null)
                  setRealName('')
                  setPerformingName('')
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-medium text-white hover:bg-fuchsia-500 disabled:opacity-50"
              disabled={!realName || !performingName || createM.isPending}
              onClick={() => createM.mutate()}
            >
              Create
            </button>
          )}
        </div>
      </div>

      {artistsQ.isLoading ? <div className="rounded-lg border border-white/10 bg-white/5 p-4">Loading…</div> : null}
      {artistsQ.isError ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">Failed to load.</div> : null}

      <div className="grid gap-3">
        {(artistsQ.data ?? []).map((a) => (
          <div key={a.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-medium text-white">{a.performing_name}</div>
                <div className="text-sm text-stone-400">
                  {a.real_name} · {a.date_of_birth}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                  onClick={() => {
                    setEditingId(a.id)
                    setRealName(a.real_name)
                    setPerformingName(a.performing_name)
                    setDob(a.date_of_birth)
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

