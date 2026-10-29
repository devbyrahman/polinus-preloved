import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import CreateListing from './pages/CreateListing'
import EditListing from './pages/EditListing'
import ListingDetail from './pages/ListingDetail'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        {/* Konten utama dinamis yang berganti sesuai rute URL */}
        <main>
          <Routes>
            {/* Rute Publik */}
            <Route path="/" element={<Home />} />
            <Route path="/katalog" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/listing/:id" element={<ListingDetail />} />

            {/*
              RUTE TERLINDUNGI (PROTECTED ROUTES):
              Hanya bisa diakses jika user sudah login (isLoggedIn === true).
              Jika belum, user otomatis diarahkan ke /login oleh <ProtectedRoute />.
            */}
            <Route
              path="/jual"
              element={
                <ProtectedRoute>
                  <CreateListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <ProtectedRoute>
                  <EditListing />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}
