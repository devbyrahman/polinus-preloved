import { createClient } from '@supabase/supabase-js'

/*
  ========================================================================
  SUPABASE CLIENT INITIALIZATION
  ========================================================================
  - Mengambil URL dan Anon Key dari environment variables Vite (.env.local)
    menggunakan `import.meta.env`.
  - Prefix `VITE_` wajib digunakan agar variabel tersebut dapat diekspos
    ke kode browser frontend.
*/
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Helper untuk memvalidasi dan memastikan URL memiliki format HTTP/HTTPS yang valid
function getSafeSupabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return 'https://placeholder-project.supabase.co'
  }

  const trimmed = rawUrl.trim()

  // Cegah string placeholder atau format token non-URL (misalnya jika user keliru memasukkan publishable key)
  if (trimmed.includes('[GANTI_') || !trimmed.startsWith('http')) {
    console.warn(
      '[Supabase Config Warning] Nilai VITE_SUPABASE_URL di .env.local bukan URL yang valid:\n' +
      `"${trimmed}"\n` +
      'URL Supabase harus berformat: https://<project-ref>.supabase.co\n' +
      'Menggunakan fallback URL sementara agar aplikasi tidak crash.'
    )
    return 'https://placeholder-project.supabase.co'
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed
    }
  } catch {
    console.warn('[Supabase Config Warning] Gagal mengurai VITE_SUPABASE_URL, menggunakan fallback URL.')
  }

  return 'https://placeholder-project.supabase.co'
}

function getSafeAnonKey(rawKey) {
  if (!rawKey || typeof rawKey !== 'string' || rawKey.includes('[GANTI_')) {
    return 'placeholder-anon-key'
  }

  const trimmed = rawKey.trim()

  // Berikan peringatan edukatif jika user tidak sengaja memasukkan secret/service-role key
  if (trimmed.startsWith('sb_secret_')) {
    console.warn(
      '[Supabase Security Warning] Anda terdeteksi menggunakan Secret Key (sb_secret_...) di frontend!\n' +
      'Gunakan "anon" / "public" key (misal sb_publishable_... atau eyJhbGciOi...) untuk keamanan.'
    )
  }

  return trimmed
}

const safeUrl = getSafeSupabaseUrl(supabaseUrl)
const safeAnonKey = getSafeAnonKey(supabaseAnonKey)

// Inisialisasi client Supabase tunggal (singleton instance) untuk dipakai di seluruh aplikasi
export const supabase = createClient(
  safeUrl,
  safeAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

