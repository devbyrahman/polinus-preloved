import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ListingSection from '../components/ListingSection'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // State statistik real-time dari Supabase
  const [stats, setStats] = useState({
    userCount: 0,
    listingCount: 0,
    isLoading: true,
  })

  /*
    ========================================================================
    FETCH REAL DATA & REAL STATS DARI SUPABASE
    ========================================================================
  */
  useEffect(() => {
    async function fetchHomeData() {
      setIsLoading(true)
      try {
        // 1. Ambil 6 barang terbaru
        const { data: newestData, error: newestError } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6)

        if (newestError) {
          console.error('Gagal mengambil koleksi terbaru:', newestError)
          setListings([])
        } else {
          setListings(newestData || [])
        }

        // 2. Ambil total real jumlah mahasiswa dan total barang tersedia
        const [usersRes, listingsRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('listings').select('*', { count: 'exact', head: true }),
        ])

        setStats({
          userCount: usersRes.count ?? 0,
          listingCount: listingsRes.count ?? 0,
          isLoading: false,
        })
      } catch (err) {
        console.error('Error saat fetch data beranda:', err)
        setListings([])
        setStats((prev) => ({ ...prev, isLoading: false }))
      } finally {
        setIsLoading(false)
      }
    }

    fetchHomeData()
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

          {/* Kolom kanan: counter stats real-time dari database */}
          <div className="relative overflow-hidden rounded-xl border border-white/20 bg-blue-950/90 shadow-md">
            {/* Ambient pattern tanpa membebani jaringan eksternal */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-sky-400/15 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-blue-400/15 blur-2xl"
            />
            <div className="relative grid grid-cols-2 gap-4 p-8">
              <div>
                <p className="text-4xl font-bold text-white">
                  {stats.isLoading ? (
                    <span className="inline-block h-9 w-12 animate-pulse rounded bg-blue-800/60" />
                  ) : (
                    stats.userCount
                  )}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-300">
                  Mahasiswa Terdaftar
                </p>
              </div>

              <div>
                <p className="text-4xl font-bold text-white">
                  {stats.isLoading ? (
                    <span className="inline-block h-9 w-12 animate-pulse rounded bg-blue-800/60" />
                  ) : (
                    stats.listingCount
                  )}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-300">
                  Barang Tersedia
                </p>
              </div>
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
