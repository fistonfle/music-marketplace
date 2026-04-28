import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, type TokenPair } from '../api/client'

type AuthUser = { id: number; email: string; is_admin: boolean }

type AuthState = {
  tokenPair: TokenPair | null
  user: AuthUser | null
  rehydrating: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Persist tokens so refresh survives reloads. (This is a small demo app; for a
// production app you’d typically prefer httpOnly cookies or a hardened storage strategy.)
const LS_KEY = 'mm_token_pair'

function loadTokenPair(): TokenPair | null {
  const raw = localStorage.getItem(LS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as TokenPair
  } catch {
    return null
  }
}

function saveTokenPair(tp: TokenPair | null) {
  if (!tp) localStorage.removeItem(LS_KEY)
  else localStorage.setItem(LS_KEY, JSON.stringify(tp))
}

const AuthCtx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokenPair, setTokenPair] = useState<TokenPair | null>(() =>
    loadTokenPair(),
  )
  const [user, setUser] = useState<AuthUser | null>(null)
  const [rehydrating, setRehydrating] = useState(true)

  async function fetchMe(access: string) {
    // Keeps UI role-aware (admin vs regular user).
    const me = await apiFetch<AuthUser>('/auth/me', { token: access })
    setUser(me)
  }

  // Rehydrate session on refresh: we persist tokens, but user state is memory-only.
  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!tokenPair) {
        if (!cancelled) setRehydrating(false)
        return
      }
      try {
        await fetchMe(tokenPair.access_token)
      } catch {
        // Access token might be expired; attempt a single refresh using the refresh token.
        try {
          const next = await apiFetch<TokenPair>('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: tokenPair.refresh_token }),
          })
          if (cancelled) return
          setTokenPair(next)
          saveTokenPair(next)
          await fetchMe(next.access_token)
        } catch {
          // Refresh failed (revoked/expired). Clear local session.
          if (cancelled) return
          setUser(null)
          setTokenPair(null)
          saveTokenPair(null)
        }
      } finally {
        if (!cancelled) setRehydrating(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  async function login(email: string, password: string) {
    // Backend uses OAuth2 password flow for login, so we submit as form-encoded.
    const form = new URLSearchParams()
    form.set('username', email)
    form.set('password', password)
    const tp = await apiFetch<TokenPair>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    setTokenPair(tp)
    saveTokenPair(tp)
    await fetchMe(tp.access_token)
  }

  async function register(email: string, password: string) {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    await login(email, password)
  }

  function logout() {
    setUser(null)
    setTokenPair(null)
    saveTokenPair(null)
  }

  const value = useMemo<AuthState>(
    () => ({ tokenPair, user, rehydrating, login, register, logout }),
    [tokenPair, user, rehydrating],
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

