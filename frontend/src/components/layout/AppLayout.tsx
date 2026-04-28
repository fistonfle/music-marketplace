import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../state/auth'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold text-white">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-600 text-white">
        ♪
      </span>
      <span className="tracking-tight">
        EZ <span className="text-stone-400">Store</span>
      </span>
    </Link>
  )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const link = (active: boolean) =>
    `rounded-md px-3 py-2 text-sm ${active ? 'bg-white/10 text-white' : 'text-stone-300 hover:bg-white/5'}`

  return (
    <div className="min-h-dvh bg-stone-950 text-stone-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
          <Logo />
          <nav className="flex flex-1 items-center gap-1">
            <NavLink to="/" end className={({ isActive }) => link(isActive)}>
              Catalog
            </NavLink>
            {user ? (
              <NavLink to="/library" className={({ isActive }) => link(isActive)}>
                Library
              </NavLink>
            ) : null}
            {user?.is_admin ? (
              <NavLink to="/admin/artists" className={({ isActive }) => link(isActive)}>
                Admin
              </NavLink>
            ) : null}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-stone-400 sm:inline">{user.email}</span>
                <button
                  className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                  onClick={() => {
                    // We keep auth state client-side; a logout is just local token deletion.
                    logout()
                    nav('/')
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link className="rounded-md bg-fuchsia-600 px-3 py-2 text-sm font-medium text-white hover:bg-fuchsia-500" to="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}

