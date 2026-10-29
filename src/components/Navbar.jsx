import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, Search, Menu, X, PlusCircle, LogOut, User } from 'lucide-react'
import { ALL_CATEGORY, allCategoryItem, categoryList } from '../data/categories'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false) // menu hamburger (mobile)
  const [isOpen, setIsOpen] = useState(false) // dropdown kategori
  const [query, setQuery] = useState('')
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Konsumsi state dan aksi autentikasi dari AuthContext (Supabase Auth)
  const { isLoggedIn, user, profile, logout } = useAuth()

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Mahasiswa'

  const closeMenu = () => setMenuOpen(false)

  // Tutup dropdown saat user klik di luar area dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectCategory = (name) => {
    navigate(name === ALL_CATEGORY ? '/katalog' : `/katalog?category=${encodeURIComponent(name)}`)
    setIsOpen(false)
    closeMenu()
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const keyword = query.trim()
    navigate(keyword ? `/katalog?search=${encodeURIComponent(keyword)}` : '/katalog')
    closeMenu()
  }

  const handleLogout = async () => {
    await logout()
    closeMenu()
    navigate('/')
  }

  const CategoryDropdown = (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex w-full items-center justify-between gap-2 rounded-md border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Kategori
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
          {[{ ...allCategoryItem, name: ALL_CATEGORY }, ...categoryList].map((cat) => {
            const Icon = cat.icon
            return (
              <li key={cat.name}>
                <button
                  type="button"
                  onClick={() => handleSelectCategory(cat.name)}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 hover:text-blue-900"
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  {cat.label ?? cat.name}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )

  const SearchBox = (
    <form onSubmit={handleSearch} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari barang preloved di Polinus..."
        className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none"
      />
    </form>
  )

  return (
    <header className="sticky top-0 z-50 bg-white text-slate-700 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 p-4">
        {/* Brand Logo */}
        <Link to="/" onClick={closeMenu} className="text-base font-bold text-blue-900 shrink-0">
          Polinus Preloved
        </Link>

        {/* Dropdown Kategori & Kotak Pencarian di Desktop */}
        <div className="hidden md:block">{CategoryDropdown}</div>
        <div className="hidden max-w-xl flex-1 md:block">{SearchBox}</div>

        {/* AREA AUTENTIKASI KANAN (DESKTOP) */}
        <div className="ml-auto hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              {/* Tombol Pasang Iklan Cepat */}
              <Link
                to="/jual"
                className="inline-flex items-center gap-1.5 rounded-md bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-800"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Jual Barang
              </Link>

              {/* Info Pengguna Login & Tombol Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-50"
                  title="Lihat Profil"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-900">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
                    {displayName}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Keluar (Logout)"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-900"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-blue-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* AREA TOMBOL KANAN (MOBILE HEADER) */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          {isLoggedIn ? (
            <Link
              to="/profile"
              onClick={closeMenu}
              className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs font-semibold text-blue-900"
              title="Buka Profil & Dagangan Saya"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900 text-[10px] font-bold text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[80px] truncate text-[11px]">{displayName}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={closeMenu}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Masuk
            </Link>
          )}

          {/* Hamburger Menu Mobile */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Buka menu"
            aria-expanded={menuOpen}
            className="rounded-md border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* PANEL MENU MOBILE DRAWER */}
      {menuOpen && (
        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 md:hidden bg-white shadow-lg animate-in slide-in-from-top-2 duration-200">
          {SearchBox}
          {CategoryDropdown}

          {isLoggedIn ? (
            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100">
              {/* Kartu Profil yang Jelas & Bisa Diklik */}
              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-3 hover:bg-blue-100/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white shadow-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="mt-0.5 inline-block text-[11px] font-semibold text-blue-900">
                      Buka Profil & Dagangan Saya →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Menu Profil Saya Eksplisit */}
              <Link
                to="/profile"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-lg border border-blue-900 bg-white py-2.5 text-xs font-semibold text-blue-900 hover:bg-blue-50"
              >
                <User className="h-4 w-4" />
                Halaman Profil Penjual
              </Link>

              {/* Tombol Jual Barang */}
              <Link
                to="/jual"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-lg bg-blue-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-800"
              >
                <PlusCircle className="h-4 w-4" />
                Pasang Iklan Barang
              </Link>

              {/* Tombol Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Keluar (Logout)
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Link
                to="/login"
                onClick={closeMenu}
                className="w-full rounded-md border border-slate-200 py-2.5 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Masuk ke Akun
              </Link>
              <Link
                to="/register"
                onClick={closeMenu}
                className="w-full rounded-md bg-blue-900 py-2.5 text-center text-xs font-semibold text-white hover:bg-blue-800"
              >
                Daftar Akun Baru
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
