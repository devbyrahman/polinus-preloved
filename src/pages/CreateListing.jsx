import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UploadCloud, Camera, X, ArrowLeft, Info, CheckCircle2 } from 'lucide-react'
import { categoryList } from '../data/categories'

// Opsi kondisi barang sesuai kesepakatan desain
const conditionOptions = [
  '100% Baru',
  'Mulus (Like New)',
  'Masih Bagus',
  'Layak Pakai',
  'Sering Dipakai',
]

export default function CreateListing() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  /*
    ========================================================================
    STATE MANAGEMENT FORM (TWO-WAY DATA BINDING)
    ========================================================================
    - Seluruh data input disimpan dalam satu objek state `formData`.
    - Setiap input HTML membaca nilai dari `formData[name]` (value binding).
    - Ketika user mengetik, event `onChange` memicu `handleInputChange` untuk
      memperbarui key yang bersangkutan tanpa menghapus key lainnya (...prev).
    - Untuk input bertipe checkbox, nilainya diambil dari `e.target.checked`.
  */
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: 'Masih Bagus',
    price: '',
    description: '',
    isCod: true,
    isNegotiable: true,
    codLocation: '',
  })

  // State untuk menyimpan daftar file foto dan URL preview sementaranya
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handler umum untuk perubahan input teks, select, dan textarea
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Handler pemilihan file foto (maksimal 5 foto)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    // Batasi akumulasi foto maksimal 5 foto
    const remainingSlots = 5 - images.length
    if (remainingSlots <= 0) {
      alert('Maksimal 5 foto barang.')
      return
    }

    const newFiles = files.slice(0, remainingSlots)
    const newImages = newFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setImages((prev) => [...prev, ...newImages])
    // Reset file input agar bisa memilih file yang sama lagi jika perlu
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Handler menghapus foto dari preview
  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => {
      // Bebaskan memori URL objek browser
      URL.revokeObjectURL(prev[indexToRemove].previewUrl)
      return prev.filter((_, idx) => idx !== indexToRemove)
    })
  }

  /*
    ========================================================================
    MOCK SUBMISSION HANDLER
    ========================================================================
    - `e.preventDefault()` mencegah reload halaman bawaan browser.
    - Menyiapkan payload data lengkap yang nantinya siap dikirim ke Supabase.
    - Menampilkan notifikasi simulasi dan mencetak hasil ke console.
  */
  const handleSubmit = (e) => {
    e.preventDefault()

    // Validasi sederhana
    if (!formData.title.trim()) {
      alert('Mohon isi judul barang.')
      return
    }
    if (!formData.category) {
      alert('Mohon pilih kategori barang.')
      return
    }
    if (!formData.price || Number(formData.price) <= 0) {
      alert('Mohon masukkan harga yang valid.')
      return
    }

    setIsSubmitting(true)

    const payload = {
      ...formData,
      price: Number(formData.price),
      totalImages: images.length,
      createdAt: new Date().toISOString(),
    }

    console.log('=== DATA IKLAN BARU (MOCK SUBMISSION) ===', payload)
    console.log('File gambar yang diunggah:', images.map((img) => img.file))

    setTimeout(() => {
      setIsSubmitting(false)
      alert('Iklan berhasil ditambahkan! (Mock)')
      navigate('/katalog')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Tombol Kembali */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        {/* Card Formulir */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
          {/* Header Form */}
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-2xl font-bold text-slate-900">
              Pasang Iklan Barang Bekas
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Isi informasi barang preloved Anda secara jujur agar cepat laku dan dipercaya sesama mahasiswa Polinus.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
            {/* 1. UPLOAD FOTO BARANG */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Foto Barang <span className="text-red-500">*</span>
              </label>
              <p className="mt-0.5 text-xs text-slate-400">
                Format JPG/PNG, maksimal 5 foto. Foto pertama akan menjadi foto sampul utama.
              </p>

              {/* Area Drag & Drop / Klik Upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition-colors hover:border-blue-900 hover:bg-slate-50"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-900">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-800">
                  Klik atau tarik foto ke sini (Maks 5 foto)
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Bisa pilih beberapa foto sekaligus
                </p>
              </div>

              {/* Thumbnail Preview Foto yang Telah Dipilih */}
              {images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={img.previewUrl}
                        alt={`Preview ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-blue-900/80 text-[9px] font-semibold text-white text-center py-0.5">
                          Sampul
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveImage(idx)
                        }}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white transition-opacity hover:bg-red-600"
                        title="Hapus Foto"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. JUDUL BARANG */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700">
                Judul Barang <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Contoh: Kipas Angin Miyako Meja 3 Kecepatan"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {/* 3. KATEGORI & KONDISI (2 Kolom di Desktop) */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-slate-700">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  <option value="" disabled>Pilih Kategori...</option>
                  {categoryList.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-semibold text-slate-700">
                  Kondisi Barang <span className="text-red-500">*</span>
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
                >
                  {conditionOptions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. HARGA (RP) */}
            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-slate-700">
                Harga Barang (Rp) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-3.5 top-3 text-sm font-medium text-slate-500">
                  Rp
                </span>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1000"
                  required
                  placeholder="Contoh: 50000"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-300 p-3 pl-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Tulis angka saja tanpa titik atau koma.
              </p>
            </div>

            {/* 5. DESKRIPSI BARANG */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700">
                Deskripsi Lengkap <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                required
                placeholder="Jelaskan spesifikasi, masa pemakaian, kelengkapan barang, serta kekurangan/minus fisik jika ada (misal ada lecet, baterai drop, dll)."
                value={formData.description}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900 leading-relaxed"
              />
            </div>

            {/* 6. OPSI TRANSAKSI & COD */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <span className="block text-sm font-semibold text-slate-800">
                Opsi Transaksi & Negosiasi
              </span>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="isCod"
                    checked={formData.isCod}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-slate-300 accent-blue-900"
                  />
                  <span>Bisa Ketemuan (COD di Kampus)</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="isNegotiable"
                    checked={formData.isNegotiable}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-slate-300 accent-blue-900"
                  />
                  <span>Boleh Ditawar (Nego)</span>
                </label>
              </div>

              {/* 7. DETAIL LOKASI COD (Opsional) */}
              {formData.isCod && (
                <div className="mt-4 border-t border-slate-200/80 pt-3">
                  <label htmlFor="codLocation" className="block text-xs font-medium text-slate-600">
                    Preferensi Lokasi COD di Sekitar Polinus (Opsional)
                  </label>
                  <input
                    id="codLocation"
                    name="codLocation"
                    type="text"
                    placeholder="Contoh: Kantin Kampus, Depan Perpustakaan, atau Gerbang Utama Polinus"
                    value={formData.codLocation}
                    onChange={handleInputChange}
                    className="mt-1.5 w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              )}
            </div>

            {/* Petunjuk Singkat Keamanan Transaksi */}
            <div className="flex items-start gap-2.5 rounded-lg bg-blue-50/70 p-3.5 text-xs text-blue-900">
              <Info className="h-4 w-4 shrink-0 text-blue-900 mt-0.5" />
              <p className="leading-relaxed">
                Calon pembeli akan langsung menghubungi Anda melalui <strong>WhatsApp</strong>. Pastikan nomor kontak di profil Anda aktif dan selalu utamakan COD di area kampus yang ramai untuk keamanan bersama.
              </p>
            </div>

            {/* TOMBOL SUBMIT */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-blue-900 py-3.5 text-center text-sm font-bold text-white shadow-xs transition-colors hover:bg-blue-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan Iklan...' : 'Tayangkan Iklan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
