import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, Building2, Calendar, Receipt, LogOut, Settings, Landmark, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Avatar } from '@/components/common'
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

// Maps a path segment to its human label for the breadcrumb.
const SEGMENT_LABEL: Record<string, string> = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  rooms: 'Rooms',
  reservations: 'Reservations',
  bills: 'Bills',
  settings: 'Settings',
}

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const [lodgeName, setLodgeName] = useState('Econ')

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

  const handleLogout = async () => {
    await authService.logout()
    navigate('/login', { replace: true })
  }

  // Show a breadcrumb only on depth pages (e.g. /customers/:id).
  const segments = location.pathname.split('/').filter(Boolean)
  const showBreadcrumb = segments.length > 1
  const rootLabel = SEGMENT_LABEL[segments[0]] ?? segments[0]

  return (
    <div className="flex min-h-full flex-col bg-background">
      {/* Navigation Header */}
      <header
        className="sticky top-0 z-40 border-b bg-surface-raised/80 backdrop-blur"
        style={{ backgroundColor: 'hsl(36 18% 97% / 0.85)' }}
      >
        <div className="container mx-auto px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                  style={{ background: 'hsl(var(--primary))' }}
                >
                  <Landmark style={{ width: 18, height: 18 }} />
                </span>
                <span className="text-xl font-semibold text-gray-900">{lodgeName}</span>
              </Link>

              <nav className="hidden items-center gap-5 md:flex">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'nav-link flex items-center gap-2 py-1 text-sm font-medium',
                        isActive ? 'active' : 'text-gray-600 hover:text-gray-900'
                      )}
                      style={isActive ? { color: 'hsl(var(--primary))' } : undefined}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* User + Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2.5 rounded-full border bg-white py-1 pl-1 pr-3 sm:flex">
                <Avatar name={user?.username} size="sm" />
                <div className="leading-tight">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  <p className="text-[11px] capitalize text-gray-400">{user?.role?.toLowerCase()}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden text-sm font-medium sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb for depth pages */}
        {showBreadcrumb && (
          <div className="border-t bg-white/40">
            <div className="container mx-auto flex items-center gap-1.5 px-6 py-2 text-sm text-gray-500">
              <Link to={`/${segments[0]}`} className="hover:text-gray-900">{rootLabel}</Link>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-medium text-gray-700">Details</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 px-6 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {lodgeName}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-gray-500 transition-colors hover:text-gray-700">Privacy</a>
              <a href="#" className="text-sm text-gray-500 transition-colors hover:text-gray-700">Terms</a>
              <a href="#" className="text-sm text-gray-500 transition-colors hover:text-gray-700">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
