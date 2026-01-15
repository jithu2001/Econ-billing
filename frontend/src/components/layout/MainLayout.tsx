import { Outlet, Link, useLocation } from 'react-router-dom'
import { Home, Users, Building2, Calendar, Receipt, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import { authService } from '@/services/auth.service'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Rooms', href: '/rooms', icon: Building2 },
  { name: 'Reservations', href: '/reservations', icon: Calendar },
  { name: 'Bills', href: '/bills', icon: Receipt },
]

export default function MainLayout() {
  const location = useLocation()
  const user = authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <div className="flex items-center gap-2 font-semibold text-xl">
              <Building2 className="h-6 w-6" />
              <span>Trinity Lodge</span>
            </div>
            <nav className="flex items-center gap-6 ml-10">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.username} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
