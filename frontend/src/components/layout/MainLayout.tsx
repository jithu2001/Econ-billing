import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Users, Building2, Calendar, Receipt, LogOut, Sparkles, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'
import { authService } from '@/services/auth.service'
import { settingsService } from '@/services/settings.service'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Rooms', href: '/rooms', icon: Building2 },
  { name: 'Reservations', href: '/reservations', icon: Calendar },
  { name: 'Bills', href: '/bills', icon: Receipt },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function MainLayout() {
  const location = useLocation()
  const user = authService.getCurrentUser()
  const [lodgeName, setLodgeName] = useState('Lodge')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await settingsService.get()
      if (settings.lodge_name) {
        setLodgeName(settings.lodge_name)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const handleLogout = () => {
    authService.logout()
  }

  return (
    <div className="min-h-screen animated-bg">
      {/* Modern Navigation Header */}
      <header className="glass sticky top-0 z-50 border-b border-slate-700/50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-3 group">
                <div className="relative">
                  <Building2 className="w-8 h-8 text-purple-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)] transition-all group-hover:drop-shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
                  <Sparkles className="w-4 h-4 text-pink-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="gradient-text text-2xl font-bold">{lodgeName}</span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-2">
                {navigation.map((item, idx) => {
                  const Icon = item.icon
                  const isActive = location.pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "slide-in-left flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 relative group",
                        isActive
                          ? "bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/20"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                      )}
                      style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute inset-0 bg-purple-500/10 rounded-lg blur-xl" />
                      )}

                      <Icon className={cn(
                        "w-5 h-5 transition-all relative z-10",
                        isActive && "drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]"
                      )} />
                      <span className="font-medium text-sm relative z-10">{item.name}</span>

                      {/* Hover effect */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300" />
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4 slide-in-right" style={{ animationDelay: '0.5s', opacity: 0 }}>
              {/* User Badge */}
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">{user?.username}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 group"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                <span className="text-sm font-medium hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="fade-in">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-auto">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} {lodgeName}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-purple-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-purple-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-slate-500 hover:text-purple-400 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
