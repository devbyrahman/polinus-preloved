import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { Share2, Flag, Check, ArrowLeft, Heart } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)

function Badge({ children }) {
  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
      {children}
    </span>
  )
}

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn } = useAuth()

  // State data barang & penjual dari Supabase
  const [listing, setListing] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // State galeri foto dan salin tautan
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  /*
    ========================================================================
    FETCH REAL DATA BARANG & PENJUAL DARI SUPABASE
    ========================================================================
  */
  useEffect(() => {
    setActiveImageIndex(0)
    setCopied(false)
    setIsSaved(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    async function fetchListingDetail() {
      setIsLoading(true)
      try {
        // Mengambil data barang sekaligus join relasi profiles penjual
        const { data, error } = await supabase
          .from('listings')
          .select('*, profiles(full_name, whatsapp_number, nim)')
          .eq('id', id)
          .single()

        if (error || !data) {
          console.error('Barang tidak ditemukan:', error)
          setListing(null)
        } else {
          setListing(data)

          // Fetch produk serupa berdasarkan kategori
          if (data.category) {
            const { data: similar } = await supabase
              .from('listings')
              .select('*')
              .eq('category', data.category)
              .neq('id', id)
              .limit(6)

            setSimilarProducts(similar || [])
          }
        }
      } catch (err) {
        console.error('Error saat fetch detail barang:', err)
        setListing(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchListingDetail()
    }
  }, [id])

  // UI saat memuat data dari Supabase
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-900 border-t-transparent" />
        <p className="text-sm font-medium text-slate-500">Memuat data barang...</p>
      </div>
    )
  }

  // UI jika barang tidak ditemukan
  if (!listing) {
    return (
      <div className="mx-auto max-w-7xl p-4 py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Barang tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-500">
          Barang mungkin sudah terjual, dinonaktifkan, atau telah dihapus oleh penjual.
        </p>
        <Link
          to="/katalog"
          className="mt-5 inline-block rounded-md bg-blue-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-800"
        >
          Lihat Semua Katalog
        </Link>
      </div>
    )
  }

  const {
    title,
    price,
    stock = 1,
    description,
    category,
    condition,
    is_cod,
    isCod,
    cod_preference,
    cod_location,
    is_negotiable,
    isNegotiable,
    image_urls = [],
  } = listing

  // Ekstrak data profil penjual hasil join
  const seller = Array.isArray(listing.profiles)
    ? listing.profiles[0]
    : listing.profiles || { full_name: 'Mahasiswa Polinus', whatsapp_number: '', nim: '-' }

  // Standarisasi nomor WA penjual
  let sellerWa = (seller.whatsapp_number || '').replace(/[^0-9]/g, '')
  if (sellerWa.startsWith('0')) {
    sellerWa = '62' + sellerWa.slice(1)
  }

  // Pesan WhatsApp ke Penjual
  const waBuyerMessage = `Halo kak ${seller.full_name || 'Penjual'}, saya tertarik dengan barang "${title}" yang dijual di Polinus Preloved.`
  const waSellerLink = sellerWa
    ? `https://wa.me/${sellerWa}?text=${encodeURIComponent(waBuyerMessage)}`
    : '#'

  // Pesan WhatsApp ke Admin untuk Laporkan Iklan
  const waReportMessage = `Halo Admin Polinus Preloved, saya ingin melaporkan iklan ini karena mencurigakan / tidak sesuai aturan:\n\nID: ${id}\nJudul: ${title}\nPenjual: ${seller.full_name} (${seller.nim})`
  const waReportLink = `https://wa.me/628000000000?text=${encodeURIComponent(waReportMessage)}`

  // Validasi foto galeri
  const images =
    Array.isArray(image_urls) && image_urls.length > 0
      ? image_urls
      : ['https://placehold.co/800x800/f1f5f9/475569?text=Polinus+Preloved']
  const activeImage = images[activeImageIndex] || images[0]

  const hasCod = is_cod ?? isCod ?? (cod_preference === 'COD')
  const hasNego = is_negotiable ?? isNegotiable

  /*
    ========================================================================
    HANDLER CTA WHATSAPP DENGAN AUTH GUARD
    ========================================================================
  */
  const handleContactSeller = (e) => {
    if (!isLoggedIn) {
      e.preventDefault()
      alert('Silakan login atau daftar terlebih dahulu untuk menghubungi penjual.')
      navigate('/login', { state: { from: location } })
      return
    }

    if (!sellerWa) {
      e.preventDefault()
      alert('Penjual belum melengkapi nomor WhatsApp aktif.')
    }
  }

  // Handler Salin Tautan (Share)
  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {
      // Fallback
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Tombol Navigasi Kembali */}
        <Link
          to="/katalog"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Katalog
        </Link>

        {/* Layout Detail Dua Kolom */}
        <div className="mt-5 grid gap-8 md:grid-cols-2">
          {/* KOLOM KIRI: Galeri Gambar */}
          <div>
            <div className="relative aspect-square md:aspect-[4/5] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              <img
                src={activeImage}
                alt={title}
                className="h-full w-full object-cover transition-opacity duration-200"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://placehold.co/800x800/f1f5f9/475569?text=Polinus+Preloved'
                }}
              />
            </div>

            {/* Baris Thumbnail Pilihan Gambar */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
                {images.map((url, idx) => {
                  const isActive = activeImageIndex === idx
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-square w-16 md:w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                        isActive
                          ? 'border-blue-900 ring-2 ring-blue-900/20 opacity-100'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${title} foto ke-${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* KOLOM KANAN: Informasi Produk & Aksi */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl leading-snug">
              {title}
            </h1>

            {/* Harga & Informasi Sisa Stok */}
            <div className="mt-3">
              <p className="text-3xl font-bold text-blue-900">
                {formatRupiah(price)}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Sisa Stok:{' '}
                <span className="font-semibold text-slate-700">{stock} item</span>
              </p>
            </div>

            {/* Badges Info */}
            <div className="mt-4 flex flex-wrap gap-2">
              {condition && <Badge>{condition}</Badge>}
              {category && <Badge>{category}</Badge>}
              {hasCod && (
                <Badge>{cod_location ? `Bisa COD (${cod_location})` : 'Bisa COD'}</Badge>
              )}
              {hasNego ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Boleh Ditawar
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  Harga Pas
                </span>
              )}
            </div>

            <hr className="my-5 border-slate-200" />

            {/* Deskripsi Barang */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Deskripsi Barang</h2>
              <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {description || 'Tidak ada deskripsi tambahan.'}
              </p>
            </div>

            <hr className="my-5 border-slate-200" />

            {/* Kartu Profil Penjual (Mahasiswa Polinus) */}
            <div className="flex items-center gap-3.5 rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">
                {seller.full_name?.charAt(0) || 'M'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Penjual Terverifikasi</p>
                <p className="truncate font-semibold text-slate-900 text-sm">
                  {seller.full_name || 'Mahasiswa Polinus'}
                </p>
                <p className="text-xs text-slate-500">
                  {seller.nim ? `NIM: ${seller.nim}` : 'Mahasiswa Aktif'}
                </p>
              </div>
            </div>

            {/* Tombol Utama: Hubungi Penjual via WhatsApp (Protected Action) */}
            <a
              href={waSellerLink}
              onClick={handleContactSeller}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block w-full rounded-lg bg-green-600 py-3.5 text-center text-sm font-semibold text-white shadow-xs transition-colors hover:bg-green-700"
            >
              Hubungi Penjual via WhatsApp
            </a>

            {/* Tombol Aksi Sekunder: Simpan, Bagikan, & Laporkan */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {/* Tombol 1: Simpan (Wishlist / Bookmark) */}
              <button
                type="button"
                onClick={() => setIsSaved((prev) => !prev)}
                className={`flex items-center justify-center gap-1.5 rounded-lg border py-2.5 text-xs font-medium transition-colors ${
                  isSaved
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    isSaved ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                  }`}
                />
                <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
              </button>

              {/* Tombol 2: Bagikan */}
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-slate-400" />
                    <span>Bagikan</span>
                  </>
                )}
              </button>

              {/* Tombol 3: Laporkan */}
              <a
                href={waReportLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/40 py-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:border-red-300"
              >
                <Flag className="h-4 w-4 text-red-400" />
                <span>Laporkan</span>
              </a>
            </div>
          </div>
        </div>

        {/* SECTION: Produk Serupa */}
        {similarProducts.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-10">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Produk Serupa</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Barang lain dalam kategori {category}
                </p>
              </div>
              <Link
                to={`/katalog?category=${encodeURIComponent(category)}`}
                className="text-xs font-semibold text-blue-900 hover:underline"
              >
                Lihat di kategori ini →
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
              {similarProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
