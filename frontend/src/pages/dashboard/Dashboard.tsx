import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Users, Building2, Calendar, Receipt, ArrowRight, Plus } from 'lucide-react'
import { customerService, roomService, reservationService, billService } from '@/services'
import { authService } from '@/services/auth.service'
import { Avatar, StatCard, StatusBadge, EmptyState, StatGridSkeleton } from '@/components/common'
import type { Customer, Room, Reservation, Bill } from '@/types'

const AMOUNT_COLOR: Record<string, string> = {
  PAID: 'hsl(var(--status-green))',
  UNPAID: 'hsl(var(--status-red))',
  FINALIZED: 'hsl(var(--status-amber))',
  DRAFT: 'hsl(var(--status-stone))',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [bills, setBills] = useState<Bill[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [customersData, roomsData, reservationsData] = await Promise.all([
        customerService.getAll(),
        roomService.getAllRooms(),
        reservationService.getAll(),
      ])
      setCustomers(customersData)
      setRooms(roomsData)
      setReservations(reservationsData)

      const allBills: Bill[] = []
      for (const customer of customersData) {
        try {
          const customerBills = await billService.getByCustomerId(customer.id)
          allBills.push(...customerBills.map(bill => ({ ...bill, customer })))
        } catch {
          // Customer might not have bills, continue
        }
      }
      setBills(allBills)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalCustomers: customers.length,
    activeReservations: reservations.filter(r => r.status === 'ACTIVE').length,
    availableRooms: rooms.filter(r => r.status === 'AVAILABLE').length,
    pendingBills: bills.filter(b => b.status === 'DRAFT' || b.status === 'UNPAID' || b.status === 'FINALIZED').length,
  }

  const recentReservations = reservations
    .filter(r => r.status === 'ACTIVE')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)

  const recentBills = bills
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  const statCards = [
    { title: 'Total Customers', value: stats.totalCustomers, icon: Users, desc: 'Registered customers', href: '/customers', accent: 'primary' as const },
    { title: 'Active Reservations', value: stats.activeReservations, icon: Calendar, desc: 'Currently checked-in', href: '/reservations', accent: 'green' as const },
    { title: 'Available Rooms', value: stats.availableRooms, icon: Building2, desc: 'Ready for check-in', href: '/rooms', accent: 'blue' as const },
    { title: 'Pending Bills', value: stats.pendingBills, icon: Receipt, desc: 'Awaiting payment', href: '/bills', accent: 'amber' as const },
  ]

  const quickActions = [
    { label: 'Add Customer', desc: 'Register a new guest', icon: Users, href: '/customers' },
    { label: 'New Reservation', desc: 'Book a room', icon: Calendar, href: '/reservations' },
    { label: 'View Bills', desc: 'Track billing & payments', icon: Receipt, href: '/bills' },
    { label: 'Manage Rooms', desc: 'Rooms & room types', icon: Building2, href: '/rooms' },
  ]

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="animate-fade-up">
        <h1 className="text-3xl font-semibold text-gray-900">
          {greeting()}, {user?.username || 'there'} <span aria-hidden="true">🏔️</span>
        </h1>
        <p className="mt-1 text-gray-500">{today}</p>
      </div>

      {/* Stats */}
      {loading ? (
        <StatGridSkeleton count={4} />
      ) : (
        <div className="stagger-children grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, idx) => (
            <StatCard
              key={stat.title}
              index={idx}
              label={stat.title}
              value={stat.value}
              icon={stat.icon}
              accent={stat.accent}
              hint={stat.desc}
              onClick={() => navigate(stat.href)}
            />
          ))}
        </div>
      )}

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Reservations — timeline */}
        <div className="card animate-fade-up">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reservations</h2>
            <button
              onClick={() => navigate('/reservations')}
              className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              View All <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {recentReservations.length > 0 ? (
            <ol className="relative ml-3 space-y-5 border-l-2 border-gray-100 pl-6">
              {recentReservations.map((reservation) => (
                <li key={reservation.id} className="relative">
                  <span
                    className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white"
                    style={{ background: 'hsl(var(--status-green))' }}
                  >
                    <span className="status-dot-active h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  <button
                    onClick={() => navigate(`/customers/${reservation.customer_id}`)}
                    className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-surface-raised"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={reservation.customer?.full_name} size="md" />
                      <div>
                        <p className="font-medium text-gray-900">{reservation.customer?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">Room {reservation.room?.room_number || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{new Date(reservation.check_in_date).toLocaleDateString()}</p>
                      <StatusBadge status="ACTIVE" className="mt-1" />
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState icon={Calendar} title="No active reservations" hint="New bookings will appear here." />
          )}
        </div>

        {/* Recent Bills */}
        <div className="card animate-fade-up">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bills</h2>
            <button
              onClick={() => navigate('/bills')}
              className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              View All <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {recentBills.length > 0 ? (
            <div className="space-y-2">
              {recentBills.map((bill) => (
                <button
                  key={bill.id}
                  onClick={() => navigate(`/customers/${bill.customer_id}`)}
                  className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-surface-raised"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={bill.customer?.full_name} size="md" />
                    <div>
                      <p className="font-medium text-gray-900">{bill.customer?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{new Date(bill.bill_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="mb-1 text-lg font-semibold tabular-nums"
                      style={{ color: AMOUNT_COLOR[bill.status] ?? 'hsl(var(--foreground))' }}
                    >
                      ₹{bill.total_amount.toLocaleString()}
                    </p>
                    <StatusBadge status={bill.status} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState icon={Receipt} title="No bills yet" hint="Bills you generate will show up here." />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-up">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.href)}
                className="card card-hover group flex items-start gap-3 text-left"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-105"
                  style={{ background: 'hsl(var(--primary))' }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="flex items-center gap-1 font-semibold text-gray-900">
                    {action.label}
                    <Plus className="h-3.5 w-3.5 text-gray-400 transition-colors group-hover:text-[hsl(var(--primary))]" />
                  </p>
                  <p className="text-sm text-gray-500">{action.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
