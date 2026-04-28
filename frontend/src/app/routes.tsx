import { Route, Routes } from 'react-router-dom'
import { CatalogPage } from '../features/catalog/CatalogPage'
import { AuthPage } from '../features/auth/AuthPage'
import { LibraryPage } from '../features/library/LibraryPage'
import { AdminArtistsPage } from '../features/admin/AdminArtistsPage'
import { AdminAlbumsPage } from '../features/admin/AdminAlbumsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CatalogPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/admin/artists" element={<AdminArtistsPage />} />
      <Route path="/admin/albums" element={<AdminAlbumsPage />} />
    </Routes>
  )
}

