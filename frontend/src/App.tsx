// App shell: top nav + route table.
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from './state/auth'
import { CatalogPage } from './pages/CatalogPage'
import { LoginPage } from './pages/LoginPage'
import { LibraryPage } from './pages/LibraryPage'
import { AdminArtistsPage } from './pages/admin/AdminArtistsPage'
import { AdminAlbumsPage } from './pages/admin/AdminAlbumsPage'

function TopNav() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const navLink =
    'rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white'
  const navLinkActive = 'bg-white/10 text-white'
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <Link to="/" className="font-semibold tracking-wide text-white">
          Music Marketplace
        </Link>
        <nav className="flex flex-1 gap-2">
          <NavLink to="/" end className={({ isActive }) => `${navLink} ${isActive ? navLinkActive : ''}`}>
            Catalog
          </NavLink>
          {user && (
            <NavLink to="/library" className={({ isActive }) => `${navLink} ${isActive ? navLinkActive : ''}`}>
              My library
            </NavLink>
          )}
          {user?.is_admin && (
            <NavLink to="/admin/artists" className={({ isActive }) => `${navLink} ${isActive ? navLinkActive : ''}`}>
              Admin
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-slate-400 sm:inline">{user.email}</span>
              <button
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                onClick={() => {
                  logout()
                  nav('/')
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link className="rounded-lg border border-sky-400/40 bg-sky-400/15 px-3 py-2 text-sm hover:bg-sky-400/25" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-5xl px-4 pb-14 pt-6">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/admin/artists" element={<AdminArtistsPage />} />
          <Route path="/admin/albums" element={<AdminAlbumsPage />} />
        </Routes>
      </main>
    </>
  )
}
