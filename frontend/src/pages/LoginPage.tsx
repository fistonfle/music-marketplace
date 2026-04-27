// Login/register page (JWT access token used for protected actions).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/auth'

export function LoginPage() {
  const nav = useNavigate()
  const { login, register } = useAuth()
  const [email, setEmail] = useState('user@example.com')
  const [password, setPassword] = useState('user123')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password)
      nav('/')
    } catch (e) {
      setError('Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold text-white">{mode === 'login' ? 'Login' : 'Register'}</h1>
      <p className="mb-4 text-slate-300">
        JWT auth is required for purchasing, rating, and viewing your library.
      </p>

      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-lg border px-3 py-2 text-sm ${
              mode === 'login'
                ? 'border-sky-400/40 bg-sky-400/15 hover:bg-sky-400/25'
                : 'border-white/15 bg-white/10 hover:bg-white/15'
            }`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`rounded-lg border px-3 py-2 text-sm ${
              mode === 'register'
                ? 'border-sky-400/40 bg-sky-400/15 hover:bg-sky-400/25'
                : 'border-white/15 bg-white/10 hover:bg-white/15'
            }`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <label className="grid gap-2">
          <span className="text-sm text-slate-400">Email</span>
          <input
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-slate-400">Password</span>
          <input
            type="password"
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-lg border border-sky-400/40 bg-sky-400/15 px-3 py-2 text-sm hover:bg-sky-400/25 disabled:opacity-50"
            disabled={busy}
            onClick={submit}
          >
            {busy ? 'Working…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  )
}

