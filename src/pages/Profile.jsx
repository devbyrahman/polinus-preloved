import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Phone,
  Mail,
  Package,
  PlusCircle,
  Edit3,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)

export default function Profile() {
  const { user, profile, logout, refreshProfile } = useAuth()
  const navigate = useNavigate()

  // State daftar iklan milik mahasiswa yang sedang login
  const [myListings, setMyListings] = useState([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)

  // State modal / form edit profil
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: '',
    whatsappNumber: '',
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('')

  // Inisialisasi form edit profil saat data profil dimuat
  useEffect(() => {
    if (profile || user) {
      setEditForm({
        fullName: profile?.full_name || user?.user_metadata?.full_name || '',
        whatsappNumber: profile?.whatsapp_number || user?.user_metadata?.whatsapp_number || '',
      })
    }
  }, [profile, user])

  /*
    ========================================================================
    FETCH DAFTAR BARANG YANG DIJUAL OLEH MAHASISWA INI
    ========================================================================
  */
  useEffect(() => {
    async function fetchUserListings() {
      if (!user) return
      setIsLoadingListings(true)
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Gagal mengambil barang milik user:', error)
          setMyListings([])
        } else {
          setMyListings(data || [])
        }
      } catch (err) {
        console.error('Error saat fetch listings user:', err)
        setMyListings([])
      } finally {
        setIsLoadingListings(false)
      }
    }

    fetchUserListings()
  }, [user])

  // Handler Hapus Iklan
  const handleDeleteListing = async (listingId, title) => {
    const konfirmasi = window.confirm(
      `Apakah Anda yakin ingin menghapus iklan "${title}"?\nTindakan ini permanen dan tidak dapat dibatalkan.`
    )
    if (!konfirmasi) return

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('seller_id', user.id)

      if (error) {
        throw error
      }

      setMyListings((prev) => prev.filter((item) => item.id !== listingId))
      alert('Iklan berhasil dihapus.')
    } catch (err) {
      console.error('Gagal menghapus iklan:', err)
      alert(`Gagal menghapus iklan: ${err.message || 'Terjadi kesalahan sistem.'}`)
    }
  }

  // Handler Simpan Perubahan Profil (Nama & WhatsApp)
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!editForm.fullName.trim()) {
      alert('Nama lengkap tidak boleh kosong.')
      return
    }

    let cleanWa = editForm.whatsappNumber.trim().replace(/[^0-9]/g, '')
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.slice(1)
    }

    setIsSavingProfile(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: editForm.fullName.trim(),
          whatsapp_number: cleanWa,
        })

      if (error) {
        throw error
      }

      if (refreshProfile) {
        await refreshProfile()
      }

      setProfileSuccessMsg('Profil berhasil diperbarui!')
      setTimeout(() => {
        setProfileSuccessMsg('')
        setIsEditingProfile(false)
      }, 1500)
    } catch (err) {
      console.error('Gagal memperbarui profil:', err)
      alert(`Gagal memperbarui profil: ${err.message || 'Terjadi kesalahan sistem.'}`)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Mahasiswa Polinus'

  const displayWa = profile?.whatsapp_number || user?.user_metadata?.whatsapp_number || ''

  // Total estimasi nilai barang yang sedang dijual
  const totalNilaiBarang = myListings.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* KARTU PROFIL UTAMA PENJUAL */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            {/* Sisi Kiri: Avatar & Biodata */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-full bg-blue-900 text-2xl md:text-3xl font-bold text-white shadow-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" />
                    Terverifikasi
                  </span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {user?.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {displayWa ? `+${displayWa}` : 'Belum isi nomor WA'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan: Tombol Aksi Profil */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5 text-blue-900" />
                {isEditingProfile ? 'Tutup Edit' : 'Edit Profil'}
              </button>

              <Link
                to="/jual"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors shadow-xs"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Pasang Iklan Baru
              </Link>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                title="Keluar"
              >
                <LogOut className="h-3.5 w-3.5" />
                Keluar
              </button>
            </div>
          </div>

          {/* FORM EDIT PROFIL (ACCORDION TOGGLE) */}
          {isEditingProfile && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/40 p-5">
              <h2 className="text-sm font-bold text-slate-900">
                Ubah Informasi Kontak & Nama
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Data nomor WhatsApp digunakan pembeli untuk menghubungi Anda secara langsung.
              </p>

              {profileSuccessMsg && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {profileSuccessMsg}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    placeholder="Nama Lengkap Mahasiswa"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Nomor WhatsApp Aktif
                  </label>
                  <input
                    type="tel"
                    required
                    value={editForm.whatsappNumber}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    placeholder="Contoh: 081234567890"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="rounded-md bg-blue-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* KARTU STATISTIK PENJUAL */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Package className="h-4 w-4 text-blue-900" />
                Iklan Aktif
              </span>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {myListings.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Nilai Dagangan
              </span>
              <p className="mt-2 text-2xl font-bold text-blue-900">
                {formatRupiah(totalNilaiBarang)}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <ShieldCheck className="h-4 w-4 text-sky-600" />
                Status Penjual
              </span>
              <p className="mt-2 text-sm font-bold text-slate-900">
                Mahasiswa Polinus
              </p>
            </div>
          </div>
        </div>

        {/* SECTION BARANG DAGANGAN SAYA */}
        <div className="mt-8">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Barang Dagangan Saya
              </h2>
              <p className="text-xs text-slate-500">
                Kelola dan edit barang preloved yang Anda tawarkan kepada sesama mahasiswa.
              </p>
            </div>

            <Link
              to="/jual"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:underline"
            >
              <PlusCircle className="h-4 w-4" />
              Tambah Iklan
            </Link>
          </div>

          {isLoadingListings ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-900 border-t-transparent" />
              <p className="text-xs font-medium text-slate-500">Memuat barang dagangan Anda...</p>
            </div>
          ) : myListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map((item) => {
                const thumbnail =
                  item.image_urls && item.image_urls.length > 0
                    ? item.image_urls[0]
                    : 'https://placehold.co/600x600/f1f5f9/475569?text=Polinus+Preloved'

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:shadow-sm"
                  >
                    <div>
                      {/* Gambar dan Badges */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={thumbnail}
                          alt={item.title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://placehold.co/600x600/f1f5f9/475569?text=Polinus+Preloved'
                          }}
                        />
                        <span className="absolute top-2 left-2 rounded-full bg-blue-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                          {item.category}
                        </span>
                      </div>

                      {/* Detail Judul dan Harga */}
                      <div className="mt-3">
                        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-base font-bold text-blue-900">
                          {formatRupiah(item.price)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Kondisi: <span className="font-medium text-slate-700">{item.condition}</span>
                        </p>
                      </div>
                    </div>

                    {/* Tombol Aksi: Lihat, Edit, Hapus */}
                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                      <Link
                        to={`/listing/${item.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        title="Lihat Iklan"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                        Lihat
                      </Link>

                      <Link
                        to={`/edit/${item.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-blue-900 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition-colors"
                        title="Edit Iklan"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteListing(item.id, item.title)}
                        className="rounded-md border border-red-200 p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Iklan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-900">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">
                Anda Belum Memiliki Barang Dagangan
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Punya buku, kipas angin, pakaian, atau barang preloved yang sudah tidak terpakai? Tawarkan sekarang ke sesama mahasiswa Polinus!
              </p>
              <Link
                to="/jual"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 shadow-xs"
              >
                <PlusCircle className="h-4 w-4" />
                Mulai Pasang Iklan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
