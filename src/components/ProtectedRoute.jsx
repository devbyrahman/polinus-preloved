import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/*
  ========================================================================
  PROTECTED ROUTE GUARD (SUPABASE AUTH)
  ========================================================================
  - Menunggu status `loading` selesai sebelum mengambil keputusan pengalihan rute.
  - Jika belum ada sesi login (`isLoggedIn === false`):
    Mengarahkan (redirect) user ke `/login` dengan menyimpan lokasi tujuan asal (`state.from`).
  - Jika sesi valid (`isLoggedIn === true`):
    Merender konten anak (`children` atau `<Outlet />`).
*/
export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  // Tunggu pengecekan LocalStorage Supabase selesai
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-900 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Memverifikasi sesi...</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children ? children : <Outlet />
}
