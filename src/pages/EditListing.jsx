import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { UploadCloud, X, ArrowLeft, Info, Trash2, Sparkles } from 'lucide-react'
import { categoryList } from '../data/categories'
import { supabase, deleteStorageFiles } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { compressMultipleImages } from '../lib/imageOptimizer'

const conditionOptions = [
  '100% Baru',
  'Mulus (Like New)',
  'Masih Bagus',
  'Layak Pakai',
  'Sering Dipakai',
]

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { user } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Foto yang sudah ada sebelumnya di Supabase Storage
  const [existingImages, setExistingImages] = useState([])
  const [removedExistingImages, setRemovedExistingImages] = useState([])

  // Foto baru yang dipilih dari perangkat
  const [newImageFiles, setNewImageFiles] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])
  const [newImageMeta, setNewImageMeta] = useState([])
  const [isOptimizingImages, setIsOptimizingImages] = useState(false)
  const [optimizingProgress, setOptimizingProgress] = useState({ current: 0, total: 0 })

  /*
    ========================================================================
    FETCH DATA IKLAN YANG AKAN DIEDIT
    ========================================================================
  */
  useEffect(() => {
    async function fetchListingData() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !data) {
          alert('Iklan tidak ditemukan.')
          navigate('/profile')
          return
        }

        // Pastikan hanya pemilik iklan yang bisa mengedit
        if (user && data.seller_id !== user.id) {
          alert('Anda tidak memiliki izin untuk mengedit iklan ini.')
          navigate(`/listing/${id}`)
          return
        }

        // Pisahkan jika deskripsi menyimpan catatan lokasi COD
        let desc = data.description || ''
        let codLoc = ''
        const codMatch = desc.match(/\n\nLokasi COD:\s*(.+)$/)
        if (codMatch) {
          codLoc = codMatch[1].trim()
          desc = desc.replace(/\n\nLokasi COD:\s*(.+)$/, '').trim()
        }

        setFormData({
          title: data.title || '',
          category: data.category || '',
          condition: data.condition || 'Masih Bagus',
          price: data.price ? String(data.price) : '',
          description: desc,
          isCod: data.is_cod ?? true,
          isNegotiable: data.is_negotiable ?? true,
          codLocation: codLoc,
        })

        setExistingImages(Array.isArray(data.image_urls) ? data.image_urls : [])
      } catch (err) {
        console.error('Error saat memuat data iklan:', err)
        alert('Terjadi kesalahan saat memuat data.')
        navigate('/profile')
      } finally {
        setIsLoading(false)
      }
    }

    if (id && user) {
      fetchListingData()
    }
  }, [id, user, navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Tambah foto baru (maks total foto 5) dengan kompresi otomatis WebP
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const totalCurrent = existingImages.length + newImageFiles.length
    const remainingSlots = 5 - totalCurrent
    if (remainingSlots <= 0) {
      alert('Maksimal total 5 foto barang.')
      return
    }

    const selectedFiles = files.slice(0, remainingSlots)

    setIsOptimizingImages(true)
    setOptimizingProgress({ current: 1, total: selectedFiles.length })

    try {
      const optimizedResults = await compressMultipleImages(
        selectedFiles,
        { maxWidth: 1200, maxHeight: 1200, quality: 0.82 },
        (current, total) => setOptimizingProgress({ current, total })
      )

      const newlyFiles = optimizedResults.map((r) => r.file)
      const newlyPreviews = optimizedResults.map((r) => r.previewUrl)
      const newlyMeta = optimizedResults.map((r) => ({
        originalFormatted: r.originalFormatted,
        compressedFormatted: r.compressedFormatted,
        reductionPercent: r.reductionPercent,
      }))

      setNewImageFiles((prev) => [...prev, ...newlyFiles])
      setNewImagePreviews((prev) => [...prev, ...newlyPreviews])
      setNewImageMeta((prev) => [...prev, ...newlyMeta])
    } catch (err) {
      console.error('Gagal mengompresi gambar baru:', err)
      const fallbackPreviews = selectedFiles.map((file) => URL.createObjectURL(file))
      setNewImageFiles((prev) => [...prev, ...selectedFiles])
      setNewImagePreviews((prev) => [...prev, ...fallbackPreviews])
    } finally {
      setIsOptimizingImages(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Hapus foto lama yang sudah ada di Supabase (tandai untuk dihapus dari storage saat simpan)
  const handleRemoveExistingImage = (idxToRemove) => {
    const removedUrl = existingImages[idxToRemove]
    if (removedUrl) {
      setRemovedExistingImages((prev) => [...prev, removedUrl])
    }
    setExistingImages((prev) => prev.filter((_, idx) => idx !== idxToRemove))
  }

  // Hapus foto baru yang baru dipilih
  const handleRemoveNewImage = (idxToRemove) => {
    if (newImagePreviews[idxToRemove]) {
      URL.revokeObjectURL(newImagePreviews[idxToRemove])
    }
    setNewImageFiles((prev) => prev.filter((_, idx) => idx !== idxToRemove))
    setNewImagePreviews((prev) => prev.filter((_, idx) => idx !== idxToRemove))
    setNewImageMeta((prev) => prev.filter((_, idx) => idx !== idxToRemove))
  }

  /*
    ========================================================================
    SUBMIT UPDATE DATA KE SUPABASE
    ========================================================================
  */
  const handleSubmit = async (e) => {
    e.preventDefault()

    const totalImages = existingImages.length + newImageFiles.length
    if (totalImages === 0) {
      alert('Mohon sediakan minimal 1 foto barang.')
      return
    }

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

    try {
      // 1. Unggah foto-foto baru jika ada
      const newlyUploadedUrls = []

      for (const file of newImageFiles) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const filePath = `${user.id}/${Date.now()}-${safeName}`

        const { error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(filePath, file, {
            contentType: file.type || 'image/webp',
            cacheControl: '31536000',
            upsert: false,
          })

        if (uploadError) {
          throw uploadError
        }

        const { data: publicUrlData } = supabase.storage
          .from('product_images')
          .getPublicUrl(filePath)

        if (publicUrlData?.publicUrl) {
          newlyUploadedUrls.push(publicUrlData.publicUrl)
        }
      }

      // Gabungkan foto lama yang dipertahankan dengan foto baru
      const finalImageUrls = [...existingImages, ...newlyUploadedUrls]

      const finalDescription =
        formData.isCod && formData.codLocation.trim()
          ? `${formData.description.trim()}\n\nLokasi COD: ${formData.codLocation.trim()}`
          : formData.description.trim()

      // 2. Update record di tabel listings
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          title: formData.title.trim(),
          description: finalDescription,
          price: Number(formData.price),
          category: formData.category,
          condition: formData.condition,
          is_negotiable: formData.isNegotiable,
          is_cod: formData.isCod,
          image_urls: finalImageUrls,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('seller_id', user.id)

      if (updateError) {
        throw updateError
      }

      // 3. Bersihkan foto lama yang telah dihapus dari Supabase Storage
      if (removedExistingImages.length > 0) {
        await deleteStorageFiles(removedExistingImages)
      }

      alert('Iklan berhasil diperbarui!')
      navigate(`/listing/${id}`)
    } catch (error) {
      console.error('Gagal memperbarui iklan:', error)
      alert(`Gagal memperbarui iklan: ${error.message || 'Terjadi kesalahan sistem.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-900 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Memuat data iklan...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* Tombol Kembali */}
        <Link
          to={`/listing/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Batal & Kembali ke Detail
        </Link>

        {/* Card Formulir Edit */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
          <div className="border-b border-slate-200 pb-5">
            <h1 className="text-2xl font-bold text-slate-900">
              Edit Iklan Barang
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Perbarui rincian, foto, harga, atau status penawaran barang Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
            {/* 1. KELOLA FOTO BARANG */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">
                  Foto Barang <span className="text-red-500">*</span>
                </label>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                  Auto Kompresi WebP
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Maksimal total 5 foto. Foto baru dari kamera HP otomatis dioptimalkan ukurannya agar website tetap kencang.
              </p>

              {/* Status Loading saat Kompresi Foto Baru */}
              {isOptimizingImages && (
                <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-900 shadow-xs">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-900 border-t-transparent" />
                  <span className="font-medium">
                    Mengompresi foto {optimizingProgress.current} dari {optimizingProgress.total}... Mohon tunggu sebentar.
                  </span>
                </div>
              )}

              {/* Grid Preview Gabungan (Foto Lama & Foto Baru) */}
              <div className="mt-3 flex flex-wrap gap-3">
                {/* Foto Lama */}
                {existingImages.map((url, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="group relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                  >
                    <img
                      src={url}
                      alt={`Foto ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-blue-900/80 text-[9px] font-semibold text-white text-center py-0.5">
                        Sampul
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white transition-opacity hover:bg-red-600"
                      title="Hapus Foto Ini"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* Foto Baru yang Baru Dipilih */}
                {newImagePreviews.map((previewUrl, idx) => {
                  const meta = newImageMeta[idx]
                  return (
                    <div
                      key={`new-${idx}`}
                      className="group relative h-20 w-20 overflow-hidden rounded-lg border-2 border-dashed border-blue-500 bg-blue-50"
                    >
                      <img
                        src={previewUrl}
                        alt={`Foto baru ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-blue-600/85 text-[8px] font-semibold text-white text-center py-0.5">
                        {meta && meta.reductionPercent > 0 ? `-${meta.reductionPercent}%` : 'Baru'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900/70 text-white transition-opacity hover:bg-red-600"
                        title="Hapus Foto Baru"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )
                })}

                {/* Kotak Tambah Foto Jika Kurang dari 5 */}
                {existingImages.length + newImageFiles.length < 5 && (
                  <button
                    type="button"
                    disabled={isOptimizingImages}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-blue-900 hover:text-blue-900 disabled:opacity-50"
                  >
                    <UploadCloud className="h-5 w-5" />
                    <span className="mt-1 text-[10px] font-medium">+ Tambah</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                disabled={isOptimizingImages}
                onChange={handleImageChange}
                className="hidden"
              />
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
                value={formData.title}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {/* 3. KATEGORI & KONDISI */}
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
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-slate-300 p-3 pl-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
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

              {formData.isCod && (
                <div className="mt-4 border-t border-slate-200/80 pt-3">
                  <label htmlFor="codLocation" className="block text-xs font-medium text-slate-600">
                    Preferensi Lokasi COD di Sekitar Polinus (Opsional)
                  </label>
                  <input
                    id="codLocation"
                    name="codLocation"
                    type="text"
                    placeholder="Contoh: Kantin Kampus, Depan Perpustakaan"
                    value={formData.codLocation}
                    onChange={handleInputChange}
                    className="mt-1.5 w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              )}
            </div>

            {/* TOMBOL SIMPAN PERUBAHAN */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                to={`/listing/${id}`}
                className="w-full sm:w-1/3 rounded-lg border border-slate-300 py-3.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-2/3 rounded-lg bg-blue-900 py-3.5 text-center text-sm font-bold text-white shadow-xs transition-colors hover:bg-blue-800 disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Iklan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
