import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../state/auth'

export function AuthPage() {
  const nav = useNavigate()
  const loc = useLocation() as { state?: { from?: string } }
  const { login, register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password)
      nav(loc.state?.from ?? '/')
    } catch {
      setError('Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-white">{mode === 'login' ? 'Login' : 'Register'}</h1>
      <p className="mt-1 text-sm text-stone-400">Sign in to purchase, rate, and view your library.</p>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex gap-2">
          <button
            className={`rounded-md border px-3 py-2 text-sm ${mode === 'login' ? 'border-fuchsia-500/40 bg-fuchsia-500/10' : 'border-white/15 bg-white/5'}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`rounded-md border px-3 py-2 text-sm ${mode === 'register' ? 'border-fuchsia-500/40 bg-fuchsia-500/10' : 'border-white/15 bg-white/5'}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs text-stone-400">Email</span>
            <input
              className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-stone-400">Password</span>
            <input
              type="password"
              className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</div>
          ) : null}

          <button
            className="rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-medium text-white hover:bg-fuchsia-500 disabled:opacity-50"
            disabled={busy}
            onClick={submit}
          >
            {busy ? 'Working…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </div>

        <p className="mt-4 text-sm text-stone-400">
          <Link className="text-fuchsia-300 hover:text-fuchsia-200" to="/">
            ← Back to catalog
          </Link>
        </p>
      </div>
    </div>
  )
}

