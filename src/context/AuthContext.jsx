import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/*
  ========================================================================
  SUPABASE AUTH CONTEXT (REAL AUTHENTICATION)
  ========================================================================
  - Mengelola sesi (session) dan pengguna (user) aktif secara real-time
    langsung dari Supabase Auth.
  - `session`: objek sesi JWT token dari Supabase.
  - `user`: objek akun dari auth.users (id, email, dll).
  - `profile`: data biodata mahasiswa dari tabel public.profiles (full_name, nim, whatsapp_number).
  - `loading`: boolean status saat memeriksa sesi awal di local storage.
  - `logout`: memicu supabase.auth.signOut() untuk menghapus sesi.
*/
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fungsi helper untuk mengambil data biodata mahasiswa dari tabel `profiles`
  const fetchProfile = async (userId, userObj = null) => {
    if (!userId) {
      setProfile(null)
      return
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data) {
        setProfile(data)
        return
      }

      // Jika data profil belum ada di tabel profiles, buatkan otomatis dari user_metadata
      const meta = userObj?.user_metadata
      if (meta?.full_name || meta?.whatsapp_number || meta?.nim) {
        const fallbackProfile = {
          id: userId,
          full_name: meta.full_name || 'Mahasiswa',
          nim: meta.nim || '',
          whatsapp_number: meta.whatsapp_number || '',
        }
        const { data: created } = await supabase
          .from('profiles')
          .upsert([fallbackProfile])
          .select()
          .maybeSingle()

        setProfile(created || fallbackProfile)
      } else {
        setProfile(null)
      }
    } catch (err) {
      console.error('Gagal mengambil profil mahasiswa:', err)
      setProfile(null)
    }
  }

  useEffect(() => {
    // 1. Ambil sesi awal yang tersimpan di LocalStorage browser saat aplikasi dibuka
    supabase.auth
      .getSession()
      .then(({ data }) => {
        const session = data?.session ?? null
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id, session.user)
        }
      })
      .catch((err) => {
        console.warn('[AuthContext] Gagal mengambil sesi awal:', err)
      })
      .finally(() => {
        setLoading(false)
      })

    // 2. Pasang event listener untuk mendeteksi perubahan status login (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        await fetchProfile(newSession.user.id, newSession.user)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Fungsi logout resmi Supabase
  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Error saat logout:', err)
    } finally {
      setSession(null)
      setUser(null)
      setProfile(null)
    }
  }

  const value = {
    session,
    user,
    profile,
    isLoggedIn: Boolean(session),
    loading,
    logout,
    refreshProfile: () => user && fetchProfile(user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam <AuthProvider>')
  }
  return context
}
