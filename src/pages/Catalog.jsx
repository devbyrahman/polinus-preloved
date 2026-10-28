import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { RotateCcw, Filter, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { supabase } from '../lib/supabase'
import { ALL_CATEGORY, categoryList } from '../data/categories'

// Opsi filter kategori
const categories = [ALL_CATEGORY, ...categoryList.map((c) => c.name)]

// Opsi filter kondisi/status barang
const conditionOptions = [
  '100% Baru',
  'Mulus (Like New)',
  'Masih Bagus',
  'Layak Pakai',
  'Sering Dipakai',
]

// Opsi filter negosiasi
const negoOptions = [
  { label: 'Semua', value: 'semua' },
  { label: 'Boleh Ditawar', value: 'nego' },
  { label: 'Harga Pas', value: 'pas' },
]

// Opsi filter metode transaksi
const methodOptions = [
  { label: 'Semua', value: 'semua' },
  { label: 'Bisa Ketemuan (COD)', value: 'cod' },
  { label: 'Kirim Paket Saja', value: 'kirim' },
]

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()

  // 1. State data katalog real Supabase
  const [allListings, setAllListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // 2. Kategori dibaca dari URL query string (?category=...)
  const selectedCategory = searchParams.get('category') || ALL_CATEGORY
  const search = (searchParams.get('search') || '').trim()
  const minPriceParam = searchParams.get('minPrice') || ''
  const maxPriceParam = searchParams.get('maxPrice') || ''

  // 3. State lokal untuk filter sidebar
  const [selectedConditions, setSelectedConditions] = useState([])
  const [selectedNego, setSelectedNego] = useState('semua')
  const [selectedMethod, setSelectedMethod] = useState('semua')

  // State untuk form rentang harga
  const [inputMin, setInputMin] = useState(minPriceParam)
  const [inputMax, setInputMax] = useState(maxPriceParam)

  // State untuk toggle filter drawer di tampilan layar mobile
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Fetch real data dari Supabase
  useEffect(() => {
    async function fetchAllListings() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Gagal mengambil data katalog:', error)
          setAllListings([])
        } else {
          setAllListings(data || [])
        }
      } catch (err) {
        console.error('Error fetch all listings:', err)
        setAllListings([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllListings()
  }, [])

  // Sinkronisasi input harga jika URL searchParams berubah (misal tombol Back browser)
  useEffect(() => {
    setInputMin(minPriceParam)
    setInputMax(maxPriceParam)
  }, [minPriceParam, maxPriceParam])

  // Sinkronisasi legacy param ?cod=1 jika ada di URL saat pertama masuk
  useEffect(() => {
    if (searchParams.get('cod') === '1') {
      setSelectedMethod('cod')
    }
  }, [searchParams])

  // Helper ganti kategori di URL params
  const handleCategoryChange = (cat) => {
    const next = new URLSearchParams(searchParams)
    if (cat === ALL_CATEGORY) {
      next.delete('category')
    } else {
      next.set('category', cat)
    }
    setSearchParams(next)
  }

  // Toggle checkbox kondisi (multiple selection)
  const handleConditionToggle = (cond) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    )
  }

  // Handler apply rentang harga ke URL params
  const handleApplyPrice = (e) => {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (inputMin && Number(inputMin) > 0) {
      next.set('minPrice', inputMin)
    } else {
      next.delete('minPrice')
    }

    if (inputMax && Number(inputMax) > 0) {
      next.set('maxPrice', inputMax)
    } else {
      next.delete('maxPrice')
    }
    setSearchParams(next)
  }

  // Reset semua filter kembali ke kondisi default
  const handleResetAll = () => {
    setSelectedConditions([])
    setSelectedNego('semua')
    setSelectedMethod('semua')
    setInputMin('')
    setInputMax('')
    const next = new URLSearchParams()
    if (search) next.set('search', search) // pertahankan search keyword jika ada
    setSearchParams(next)
  }

  /*
    ========================================================================
    LOGIKA MULTI-FILTER KUMULATIF (AND LOGIC)
    ========================================================================
    Sebuah item hanya akan ditampilkan jika memenuhi SEMUA kriteria filter yang aktif:
    1. Kategori: sama dengan kategori terpilih ATAU bernilai 'Semua'.
    2. Status Barang: jika ada kondisi yang dicentang, item.condition harus
       termasuk dalam daftar `selectedConditions`. Jika kosong, loloskan semua.
    3. Opsi Tawar:
       - 'semua' -> lolos
       - 'nego'  -> item.isNegotiable harus true
       - 'pas'   -> item.isNegotiable harus false
    4. Metode Transaksi:
       - 'semua' -> lolos
       - 'cod'   -> item.isCod harus true
       - 'kirim' -> item.isCod harus false
    5. Rentang Harga:
       - minPrice <= item.price <= maxPrice
    6. Search:
       - judul mengandung kata kunci pencarian.
  */
  const minPriceNum = minPriceParam ? Number(minPriceParam) : 0
  const maxPriceNum = maxPriceParam ? Number(maxPriceParam) : Infinity

  const filteredListings = allListings.filter((item) => {
    // 1. Kategori
    const matchCategory =
      selectedCategory === ALL_CATEGORY || item.category === selectedCategory

    // 2. Status Barang
    const matchCondition =
      selectedConditions.length === 0 || selectedConditions.includes(item.condition)

    // 3. Opsi Tawar (DB: is_negotiable)
    const isNegotiable = item.is_negotiable ?? item.isNegotiable
    const matchNego =
      selectedNego === 'semua' ||
      (selectedNego === 'nego' && isNegotiable) ||
      (selectedNego === 'pas' && !isNegotiable)

    // 4. Metode Transaksi (DB: is_cod)
    const isCod = item.is_cod ?? item.isCod ?? (item.cod_preference === 'COD')
    const matchMethod =
      selectedMethod === 'semua' ||
      (selectedMethod === 'cod' && isCod) ||
      (selectedMethod === 'kirim' && !isCod)

    // 5. Rentang Harga
    const price = Number(item.price) || 0
    const matchPrice = price >= minPriceNum && price <= maxPriceNum

    // 6. Pencarian Teks
    const matchSearch =
      !search || item.title.toLowerCase().includes(search.toLowerCase())

    return (
      matchCategory &&
      matchCondition &&
      matchNego &&
      matchMethod &&
      matchPrice &&
      matchSearch
    )
  })

  // Cek apakah ada filter non-default yang sedang aktif
  const hasActiveFilters =
    selectedCategory !== ALL_CATEGORY ||
    selectedConditions.length > 0 ||
    selectedNego !== 'semua' ||
    selectedMethod !== 'semua' ||
    Boolean(minPriceParam) ||
    Boolean(maxPriceParam)

  // Judul dinamis katalog
  const catalogTitle = search
    ? `Hasil Pencarian: "${search}"`
    : selectedCategory === ALL_CATEGORY
      ? 'Semua Barang'
      : selectedCategory

  // Komponen Konten Sidebar Filter
  const FilterSidebarContent = () => (
    <div className="flex flex-col gap-6 text-sm">
      {/* Header Sidebar & Reset Button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <span className="font-bold text-slate-900 flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-900" />
          Filter Pencarian
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetAll}
            className="flex items-center gap-1 text-xs font-medium text-blue-900 hover:text-blue-700 hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* SECTION 1: Kategori Barang */}
      <div>
        <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-900">
          Kategori Barang
        </h3>
        <div className="max-h-56 overflow-y-auto pr-1 flex flex-col gap-1">
          {categories.map((cat) => {
            const active = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  handleCategoryChange(cat)
                  setMobileFilterOpen(false)
                }}
                className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                  active
                    ? 'bg-blue-50 font-semibold text-blue-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* SECTION 2: Status Barang (Kondisi) */}
      <div className="border-t border-slate-200 pt-5">
        <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-900">
          Status Barang
        </h3>
        <div className="flex flex-col gap-2">
          {conditionOptions.map((cond) => {
            const checked = selectedConditions.includes(cond)
            return (
              <label
                key={cond}
                className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleConditionToggle(cond)}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-900"
                />
                <span>{cond}</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* SECTION 3: Opsi Tawar */}
      <div className="border-t border-slate-200 pt-5">
        <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-900">
          Opsi Tawar
        </h3>
        <div className="flex flex-col gap-2">
          {negoOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900"
            >
              <input
                type="radio"
                name="negoFilter"
                value={opt.value}
                checked={selectedNego === opt.value}
                onChange={() => setSelectedNego(opt.value)}
                className="h-4 w-4 border-slate-300 accent-blue-900"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SECTION 4: Metode Transaksi */}
      <div className="border-t border-slate-200 pt-5">
        <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-900">
          Metode Transaksi
        </h3>
        <div className="flex flex-col gap-2">
          {methodOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900"
            >
              <input
                type="radio"
                name="methodFilter"
                value={opt.value}
                checked={selectedMethod === opt.value}
                onChange={() => setSelectedMethod(opt.value)}
                className="h-4 w-4 border-slate-300 accent-blue-900"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SECTION 5: Rentang Harga (di paling bawah) */}
      <div className="border-t border-slate-200 pt-5">
        <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-900">
          Rentang Harga
        </h3>
        <form onSubmit={handleApplyPrice} className="flex flex-col gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="Harga Minimum"
              value={inputMin}
              onChange={(e) => setInputMin(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none"
            />
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-2 text-xs text-slate-400">Rp</span>
            <input
              type="number"
              min="0"
              step="1000"
              placeholder="Harga Maksimum"
              value={inputMax}
              onChange={(e) => setInputMax(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none"
            />
          </div>

          <div className="mt-1 flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-md bg-blue-900 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-blue-800"
            >
              Terapkan
            </button>
            {(minPriceParam || maxPriceParam) && (
              <button
                type="button"
                onClick={() => {
                  setInputMin('')
                  setInputMax('')
                  const next = new URLSearchParams(searchParams)
                  next.delete('minPrice')
                  next.delete('maxPrice')
                  setSearchParams(next)
                }}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-6 p-4 py-8">
        {/*
          SIDEBAR DESKTOP:
          - Lebar tetap `w-64`, tidak menyusut `shrink-0`.
          - Latar putih/transparan bersih dengan border kanan tipis `border-r border-slate-200`.
          - Disembunyikan pada layar mobile (`hidden md:block`).
        */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 pr-5 md:block">
          <FilterSidebarContent />
        </aside>

        {/* AREA KONTEN UTAMA */}
        <main className="min-w-0 flex-1">
          {/* Header Baris Atas */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{catalogTitle}</h1>
              <p className="mt-1 text-sm text-slate-500">
                Menampilkan {filteredListings.length} barang
              </p>
            </div>

            {/* Tombol Buka Filter di Mobile */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
            >
              <Filter className="h-3.5 w-3.5 text-blue-900" />
              Filter {hasActiveFilters ? '(Aktif)' : ''}
            </button>
          </div>

          {/* Grid Barang Hasil Filter */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-900 border-t-transparent" />
              <p className="text-sm font-medium text-slate-500">Memuat data katalog...</p>
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filteredListings.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-slate-600 font-medium">
                Tidak ada barang yang cocok dengan filter yang dipilih.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Coba sesuaikan kombinasi status barang, opsi tawar, atau rentang harga.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-blue-900 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Semua Filter
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* DRAWER FILTER MOBILE (MODAL OVERLAY) */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-4/5 max-w-sm flex-col bg-white p-5 shadow-xl overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-bold text-slate-900">Filter Pencarian</span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebarContent />
            <div className="mt-6 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full rounded-md bg-blue-900 py-2.5 text-center text-xs font-semibold text-white"
              >
                Tampilkan ({filteredListings.length} Barang)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
