// App shell: top nav + route table.
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from './state/auth'
import { CatalogPage } from './pages/CatalogPage'
import { LoginPage } from './pages/LoginPage'
import { LibraryPage } from './pages/LibraryPage'
import { AdminArtistsPage } from './pages/admin/AdminArtistsPage'
import { AdminAlbumsPage } from './pages/admin/AdminAlbumsPage'

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-fuchsia-500 to-rose-600 text-lg shadow-lg shadow-fuchsia-900/50 ring-1 ring-white/20 transition group-hover:scale-[1.02]">
        <span className="sr-only">Home</span>
        <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-white">
        Aria <span className="text-stone-500">·</span> <span className="text-stone-300">Store</span>
      </span>
    </Link>
  )
}

function TopNav() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const link = (active: boolean) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      active
        ? 'bg-white/10 text-white shadow-inner'
        : 'text-stone-400 hover:bg-white/5 hover:text-stone-200'
    }`
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-stone-950/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="flex flex-1 flex-wrap items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={({ isActive }) => link(isActive)}>
            Discover
          </NavLink>
          {user && (
            <NavLink to="/library" className={({ isActive }) => link(isActive)}>
              My library
            </NavLink>
          )}
          {user?.is_admin && (
            <NavLink to="/admin/artists" className={({ isActive }) => link(isActive)}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="hidden max-w-[200px] truncate text-sm text-stone-400 md:inline">{user.email}</span>
              <button
                type="button"
                className="btn-secondary !py-2 text-sm"
                onClick={() => {
                  logout()
                  nav('/')
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <Link className="btn-primary !py-2 text-sm" to="/login">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-black/20 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="font-display text-sm font-semibold text-stone-300">Aria Store</div>
          <p className="mt-1 max-w-md text-sm text-stone-500">
            Browse artists, buy albums once, rate what you own — a compact marketplace demo.
          </p>
        </div>
        <p className="text-xs text-stone-600">© {new Date().getFullYear()} Music Marketplace</p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/admin/artists" element={<AdminArtistsPage />} />
          <Route path="/admin/albums" element={<AdminAlbumsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
