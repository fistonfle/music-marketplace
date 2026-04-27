// Login/register page (JWT access token used for protected actions).
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
    } catch {
      setError('Authentication failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center pt-4">
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-fuchsia-500 to-rose-600 shadow-xl shadow-fuchsia-950/50 ring-1 ring-white/20">
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
      </div>
      <h1 className="font-display text-center text-3xl font-bold text-white">
        {mode === 'login' ? 'Welcome back' : 'Create account'}
      </h1>
      <p className="mt-2 text-center text-sm text-stone-500">
        Buy albums and manage your library — secure JWT session.
      </p>

      <div className="card-glass mt-10 w-full p-8">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/40 p-1 ring-1 ring-white/10">
          <button
            type="button"
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${
              mode === 'login'
                ? 'bg-white/10 text-white shadow'
                : 'text-stone-500 hover:text-stone-300'
            }`}
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`rounded-lg py-2.5 text-sm font-semibold transition ${
              mode === 'register'
                ? 'bg-white/10 text-white shadow'
                : 'text-stone-500 hover:text-stone-300'
            }`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-stone-500">Email</span>
            <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-stone-500">Password</span>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-center text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <button type="button" className="btn-primary mt-8 w-full" disabled={busy} onClick={submit}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p className="mt-8 text-center text-sm text-stone-500">
          <Link className="text-fuchsia-400/90 hover:text-fuchsia-300" to="/">
            ← Back to catalog
          </Link>
        </p>
      </div>
    </div>
  )
}
