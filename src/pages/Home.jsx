import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ListingSection from '../components/ListingSection'
import { supabase } from '../lib/supabase'

const stats = [
  { value: '400+', label: 'Mahasiswa Terdaftar' },
  { value: '90+', label: 'Barang Tersedia' },
]

export default function Home() {
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  /*
    ========================================================================
    FETCH REAL DATA DARI SUPABASE
    ========================================================================
    Mengambil 6 barang terbaru yang diurutkan berdasarkan `created_at` secara menurun.
  */
  useEffect(() => {
    async function fetchNewestListings() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6)

        if (error) {
          console.error('Gagal mengambil koleksi terbaru:', error)
          setListings([])
        } else {
          setListings(data || [])
        }
      } catch (err) {
        console.error('Error fetch listings:', err)
        setListings([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNewestListings()
  }, [])

  return (
    <>
      {/* ===== HERO: 2 kolom di desktop, menumpuk di mobile ===== */}
      <section className="bg-blue-900">
        <div className="mx-auto grid max-w-6xl items-center gap-8 p-4 py-12 md:grid-cols-2 md:py-16">
          {/* Kolom kiri: headline + CTA */}
          <div>
            <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
              Marketplace Preloved Khusus Mahasiswa Polinus
            </h1>
            <p className="mt-4 text-slate-300">
              Cari perlengkapan kos, buku, atau elektronik bekas layak pakai dari sesama mahasiswa. Hemat dan praktis.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/katalog"
                className="rounded-md bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-400"
              >
                Mulai Jelajah
              </Link>
              <Link
                to="/jual"
                className="rounded-md border border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Jual Barang
              </Link>
            </div>
          </div>

          {/* Kolom kanan: pola latar pudar + counter stats */}
          <div className="relative overflow-hidden rounded-xl border border-white/20 bg-blue-950">
            <img
              src="https://picsum.photos/seed/campus/800/500"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-10"
            />
            <div className="relative grid grid-cols-2 gap-4 p-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-4xl font-bold text-white">{s.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-300">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION KATALOG REAL SUPABASE ===== */}
      <div className="bg-slate-50 min-h-[40vh]">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-900 border-t-transparent" />
              <p className="text-sm font-medium text-slate-500">Memuat data barang...</p>
            </div>
          ) : listings.length > 0 ? (
            <ListingSection
              title="Koleksi Terbaru"
              subtitle="Baru saja diunggah mahasiswa Polinus"
              listings={listings}
            />
          ) : (
            <div className="my-12 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h3 className="text-base font-bold text-slate-900">Belum ada barang diiklankan</h3>
              <p className="mt-1 text-xs text-slate-500">
                Jadilah mahasiswa pertama yang menjual barang preloved di Polinus!
              </p>
              <Link
                to="/jual"
                className="mt-4 inline-block rounded-md bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
              >
                Pasang Iklan Sekarang
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
