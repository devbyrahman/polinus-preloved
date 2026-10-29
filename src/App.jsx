import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

// Route-level code-splitting untuk loading awal yang super cepat
const Home = lazy(() => import('./pages/Home'))
const Catalog = lazy(() => import('./pages/Catalog'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const CreateListing = lazy(() => import('./pages/CreateListing'))
const EditListing = lazy(() => import('./pages/EditListing'))
const ListingDetail = lazy(() => import('./pages/ListingDetail'))

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-900 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        {/* Konten utama dinamis yang berganti sesuai rute URL, pb-20 pada mobile untuk ruang Bottom Navigation Bar */}
        <main className="pb-20 md:pb-6">
          <Suspense fallback={<PageFallback />}>
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
          </Suspense>
        </main>
        {/* Navigasi Bawah Modern Standar Marketplace Khusus Tampilan Layar HP */}
        <BottomNav />
      </div>
    </AuthProvider>
  )
}
