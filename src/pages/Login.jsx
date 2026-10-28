import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, LogIn, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  // Ambil lokasi asal jika user dilempar dari ProtectedRoute, default ke /
  const from = location.state?.from?.pathname || '/'

  /*
    ========================================================================
    FORM STATE LOGIN
    ========================================================================
  */
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errorMessage) setErrorMessage('')
  }

  /*
    ========================================================================
    REAL SUPABASE SIGN IN
    ========================================================================
    Memanggil supabase.auth.signInWithPassword() untuk memvalidasi kredensial.
    Sesi dan user akan otomatis terdeteksi oleh AuthContext via onAuthStateChange.
  */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      })

      if (error) {
        throw error
      }

      // Login berhasil, arahkan kembali ke rute asal atau beranda
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Login gagal:', err)
      const rawMsg = err.message || ''
      if (rawMsg === 'Invalid login credentials') {
        setErrorMessage('Email atau kata sandi salah. Silakan periksa kembali.')
      } else if (rawMsg.toLowerCase().includes('email not confirmed')) {
        setErrorMessage(
          'Email belum dikonfirmasi! Di dashboard Supabase, matikan toggle "Confirm email" di menu Sign In / Providers > Email, atau klik titik tiga (...) pada user lalu pilih "Confirm user".'
        )
      } else {
        setErrorMessage(rawMsg || 'Terjadi kesalahan saat masuk. Silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        {/* Navigasi Kembali */}
        <div className="mb-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Masuk ke Akun Anda</h1>
          <p className="mt-1 text-xs text-slate-500">
            Gunakan email dan kata sandi Anda untuk mengakses Polinus Preloved.
          </p>
        </div>

        {/* Notifikasi Error jika login gagal */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulir Masuk */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 1. Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="nama@polinus.ac.id"
              value={formData.email}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* 2. Kata Sandi */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
              Kata Sandi <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* Tombol Submit Masuk */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-blue-800 disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" />
            <span>{loading ? 'Memeriksa Kredensial...' : 'Masuk'}</span>
          </button>
        </form>

        {/* Footer Link ke Register */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-blue-900 hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}
