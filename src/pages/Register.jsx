import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Register() {
  const navigate = useNavigate()

  /*
    ========================================================================
    FORM STATE REGISTRASI
    ========================================================================
    Menampung seluruh data mahasiswa yang diperlukan:
    - Akun: email & password (akan masuk ke auth.users)
    - Profil: fullName, whatsapp (akan masuk ke public.profiles)
  */
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
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
    REAL SUPABASE REGISTRATION (SIGN UP & PROFILES INSERT)
    ========================================================================
    Langkah 1: Mendaftarkan akun ke auth.users via supabase.auth.signUp()
    Langkah 2: Memasukkan biodata pelengkap ke tabel public.profiles
  */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setLoading(true)

    // Standarisasi nomor WhatsApp ke format internasional 628...
    let cleanWa = formData.whatsapp.trim().replace(/[^0-9]/g, '')
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.slice(1)
    }

    try {
      // 1. Panggil Supabase Auth SignUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            whatsapp_number: cleanWa,
          },
        },
      })

      if (authError) {
        throw authError
      }

      // 2. Jika akun user berhasil dibuat, insert ke tabel public.profiles
      if (authData?.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: authData.user.id,
            full_name: formData.fullName.trim(),
            whatsapp_number: cleanWa,
          },
        ])

        if (profileError) {
          console.error('Gagal menyimpan profil:', profileError)
          // Jika insert profil gagal, tetap beri tahu user tapi akun auth sudah ada
        }
      }

      // 3. Auto-Login: Karena konfirmasi email sudah dimatikan di Supabase,
      // signUp otomatis membuat sesi aktif. Arahkan pengguna langsung ke Beranda (/).
      alert('Pendaftaran berhasil! Selamat datang di Polinus Preloved.')
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Pendaftaran gagal:', err)
      setErrorMessage(
        err.message || 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
      )
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
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Daftar Akun Baru</h1>
          <p className="mt-1 text-xs text-slate-500">
            Lengkapi data diri Anda untuk mulai jual-beli di Polinus Preloved.
          </p>
        </div>

        {/* Notifikasi Error jika ada */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulir Pendaftaran */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 1. Nama Lengkap */}
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* 2. Nomor WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-xs font-semibold text-slate-700">
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              required
              placeholder="Contoh: 081234567890"
              value={formData.whatsapp}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Gunakan nomor aktif untuk transaksi dan COD.
            </p>
          </div>

          {/* 4. Email */}
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

          {/* 5. Kata Sandi */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
              Kata Sandi <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-md border border-slate-300 p-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* Tombol Submit Daftar */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 py-2.5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-blue-800 disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            <span>{loading ? 'Mendaftarkan Akun...' : 'Daftar'}</span>
          </button>
        </form>

        {/* Footer Link ke Login */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-blue-900 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
