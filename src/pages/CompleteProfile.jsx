import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, Phone, ShieldCheck, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function CompleteProfile() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login } = useAuth()

  // Ambil lokasi asal jika sebelumnya user ingin menuju ke halaman tertentu (misal /jual)
  const from = location.state?.from?.pathname || '/'

  // State untuk melengkapi NIM dan WhatsApp
  const [formData, setFormData] = useState({
    nim: user?.nim || '',
    whatsapp: user?.whatsapp_number?.replace(/^62/, '0') || '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /*
    ========================================================================
    PROGRESSIVE PROFILING SUBMIT HANDLER
    ========================================================================
    - Menyatukan identitas Google OAuth dengan data mahasiswa lokal.
    - Format nomor telepon otomatis disesuaikan ke format internasional (628...).
    - Memperbarui state autentikasi di AuthContext.
    - Mengarahkan mahasiswa ke halaman Beranda atau rute awal yang dituju.
  */
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.whatsapp.trim()) {
      alert('Mohon masukkan nomor WhatsApp aktif Anda.')
      return
    }
    if (!formData.nim.trim()) {
      alert('Mohon masukkan NIM Anda.')
      return
    }

    setIsSubmitting(true)

    // Standarisasi nomor WhatsApp
    let cleanWa = formData.whatsapp.trim().replace(/[^0-9]/g, '')
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.slice(1)
    }

    // Update profil di AuthContext
    login({
      ...user,
      nim: formData.nim.trim(),
      whatsapp_number: cleanWa,
    })

    setTimeout(() => {
      setIsSubmitting(false)
      alert('Profil berhasil dilengkapi! Selamat berbelanja di Polinus Preloved.')
      navigate(from, { replace: true })
    }, 400)
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        {/* Header Ikon & Judul */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-900 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Selangkah Lagi!</h1>
          <p className="mt-1 text-xs text-slate-500">
            Lengkapi data diri Anda untuk mulai jual-beli di Polinus Preloved.
          </p>
        </div>

        {/* Badge Identitas Akun Google yang Sedang Terhubung */}
        {user?.email && (
          <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-900 font-bold text-white text-[11px]">
              {user.full_name?.charAt(0) || 'G'}
            </div>
            <div className="min-w-0 flex-1 truncate">
              <p className="font-semibold text-slate-800 truncate">{user.full_name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Google Terhubung
            </span>
          </div>
        )}

        {/* Form Lengkapi Profil */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* 1. Nomor WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-xs font-semibold text-slate-700">
              Nomor WhatsApp Aktif <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">
                <Phone className="h-4 w-4" />
              </span>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                required
                placeholder="Contoh: 08123456789"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 p-2.5 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Gunakan nomor aktif. Pembeli akan menghubungi Anda lewat nomor ini.
            </p>
          </div>

          {/* 2. NIM */}
          <div>
            <label htmlFor="nim" className="block text-xs font-semibold text-slate-700">
              NIM (Nomor Induk Mahasiswa) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <input
                id="nim"
                name="nim"
                type="text"
                required
                placeholder="Contoh: 202210045"
                value={formData.nim}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 p-2.5 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Digunakan untuk verifikasi keaslian mahasiswa Kampus Polinus.
            </p>
          </div>

          {/* Tombol Simpan & Lanjutkan */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-900 py-3 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-800 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan & Lanjutkan'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
