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
      className="fixed bottom-0 inset-x-0 z-40 block border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-4 items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                item.isActive ? 'text-blue-900' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.isProfile && isLoggedIn ? (
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                    item.isActive
                      ? 'bg-blue-900 text-white ring-2 ring-blue-900/20'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    item.isActive ? 'scale-105 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
              )}
              <span
                className={`mt-1 text-[11px] leading-tight ${
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
