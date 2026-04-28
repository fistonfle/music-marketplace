import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../state/auth'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AlbumArt } from '../../shared/ui/AlbumArt'

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
    queryFn: () => apiFetch<LibraryItem[]>('/library', { token: tokenPair!.access_token }),
  })

  const rateM = useMutation({
    mutationFn: ({ albumId, value }: { albumId: number; value: number }) =>
      apiFetch<Rating>(`/ratings/${albumId}`, {
        method: 'PUT',
        token: tokenPair!.access_token,
        body: JSON.stringify({ value }),
      }),
    onMutate: async ({ albumId }) => setSaving(albumId),
    onSettled: async () => {
      setSaving(null)
      await qc.invalidateQueries({ queryKey: ['library'] })
      await qc.invalidateQueries({ queryKey: ['albums'] })
    },
  })

  if (!user) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="font-medium text-white">Login required</div>
        <p className="mt-1 text-sm text-stone-400">View your purchased albums after logging in.</p>
        <Link className="mt-3 inline-block rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-medium text-white hover:bg-fuchsia-500" to="/login">
          Login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">My library</h1>
        <p className="text-sm text-stone-400">Purchased albums and your rating.</p>
      </div>

      {libQ.isLoading ? <div className="rounded-lg border border-white/10 bg-white/5 p-4">Loading…</div> : null}
      {libQ.isError ? <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">Failed to load.</div> : null}
      {libQ.data && libQ.data.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          No purchases yet. Go back to the catalog to buy an album.
        </div>
      ) : null}

      <div className="grid gap-3">
        {(libQ.data ?? []).map((it) => (
          <div key={it.album.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-4">
              <AlbumArt albumName={it.album.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">{it.album.name}</div>
                    <div className="text-xs text-stone-500">
                      Purchased {new Date(it.purchased_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-stone-200">
                    ${it.album.price}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-stone-400">Your rating:</span>
                  {[1, 2, 3, 4, 5].map((v) => {
                    const active = it.my_rating?.value === v
                    return (
                      <button
                        key={v}
                        className={`rounded-md border px-3 py-2 text-sm ${active ? 'border-fuchsia-500/40 bg-fuchsia-500/10' : 'border-white/15 bg-white/5 hover:bg-white/10'} disabled:opacity-50`}
                        disabled={rateM.isPending && saving === it.album.id}
                        onClick={() => rateM.mutate({ albumId: it.album.id, value: v })}
                      >
                        {v}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

