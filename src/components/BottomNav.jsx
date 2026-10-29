import { Link, useLocation } from 'react-router-dom'
import { Home, Grid, PlusCircle, User, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function BottomNav() {
  const location = useLocation()
  const { isLoggedIn, user, profile } = useAuth()
  const pathname = location.pathname

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Saya'

  const navItems = [
    {
      label: 'Beranda',
      to: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Katalog',
      to: '/katalog',
      icon: Grid,
      isActive: pathname.startsWith('/katalog'),
    },
    {
      label: 'Jual',
      to: '/jual',
      icon: PlusCircle,
      isSpecial: true,
      isActive: pathname === '/jual' || pathname === '/create',
    },
    {
      label: isLoggedIn ? 'Profil' : 'Masuk',
      to: isLoggedIn ? '/profile' : '/login',
      icon: isLoggedIn ? User : LogIn,
      isActive: pathname === '/profile' || pathname === '/login' || pathname === '/register',
      isProfile: true,
    },
  ]

  return (
    <nav
      aria-label="Navigasi bawah mobile"
      className="fixed bottom-0 inset-x-0 z-40 block border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-lg md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon

          // Tombol khusus 'Jual Barang' di tengah
          if (item.isSpecial) {
            return (
              <Link
                key={item.label}
                to={item.to}
                className="group relative -top-3 flex flex-col items-center"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all ${
                    item.isActive
                      ? 'bg-blue-800 text-white ring-4 ring-blue-100'
                      : 'bg-blue-900 text-white hover:bg-blue-800'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span
                  className={`mt-1 text-[10px] font-bold ${
                    item.isActive ? 'text-blue-900' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          }

          // Tombol Navigasi Biasa
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
                item.isActive ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.isProfile && isLoggedIn ? (
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                    item.isActive
                      ? 'bg-blue-900 text-white ring-2 ring-blue-900/30'
                      : 'bg-blue-100 text-blue-900'
                  }`}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    item.isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
              )}
              <span
                className={`mt-1 text-[10px] ${
                  item.isActive ? 'font-bold text-blue-900' : 'font-medium text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
