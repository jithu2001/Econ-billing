import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Users, Building2, Calendar, Receipt, ArrowRight, TrendingUp, Sparkles } from 'lucide-react'
import { customerService, roomService, reservationService, billService } from '@/services'
import type { Customer, Room, Reservation, Bill } from '@/types'

export default function Dashboard() {
  const navigate = useNavigate()
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
          const billsWithCustomer = customerBills.map(bill => ({
            ...bill,
            customer: customer
          }))
          allBills.push(...billsWithCustomer)
        } catch (error) {
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
    .slice(0, 3)

  const recentBills = bills
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const getBillStatusBadge = (status: Bill['status']) => {
    const styles = {
      DRAFT: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      FINALIZED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      PAID: 'bg-green-500/20 text-green-400 border-green-500/30',
      UNPAID: 'bg-red-500/20 text-red-400 border-red-500/30',
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'PAID' ? 'bg-green-400' : status === 'UNPAID' ? 'bg-red-400' : status === 'FINALIZED' ? 'bg-blue-400' : 'bg-slate-400'}`} />
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'purple',
      desc: 'Registered customers',
      href: '/customers'
    },
    {
      title: 'Active Reservations',
      value: stats.activeReservations,
      icon: Calendar,
      color: 'green',
      desc: 'Currently checked-in',
      href: '/reservations'
    },
    {
      title: 'Available Rooms',
      value: stats.availableRooms,
      icon: Building2,
      color: 'blue',
      desc: 'Ready for check-in',
      href: '/rooms'
    },
    {
      title: 'Pending Bills',
      value: stats.pendingBills,
      icon: Receipt,
      color: 'amber',
      desc: 'Awaiting payment',
      href: '/bills'
    },
  ]

  const colorClasses = {
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      shadow: 'group-hover:shadow-purple-500/30',
      glow: 'drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]'
    },
    green: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      shadow: 'group-hover:shadow-green-500/30',
      glow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]'
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      shadow: 'group-hover:shadow-blue-500/30',
      glow: 'drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]'
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      shadow: 'group-hover:shadow-amber-500/30',
      glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
    },
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="slide-in-left">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
          <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />
        </div>
        <p className="text-slate-400">Welcome back! Here's your property overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          const colors = colorClasses[stat.color as keyof typeof colorClasses]

          return (
            <div
              key={stat.title}
              onClick={() => navigate(stat.href)}
              className={`glass-card fade-in cursor-pointer group relative overflow-hidden`}
              style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/0 to-${stat.color}-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500`} />

              {/* Icon */}
              <div className={`${colors.bg} p-4 rounded-xl inline-block mb-4 transition-all duration-300 ${colors.shadow} group-hover:shadow-lg relative z-10`}>
                <Icon className={`w-8 h-8 ${colors.text} transition-all group-hover:${colors.glow}`} />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-4xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-slate-300 mb-1">{stat.title}</p>
                <p className="text-xs text-slate-500">{stat.desc}</p>
              </div>

              {/* Arrow indicator */}
              <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
            </div>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Reservations */}
        <div className="glass-card fade-in" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Recent Reservations</h2>
            </div>
            <button
              onClick={() => navigate('/reservations')}
              className="px-4 py-2 text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentReservations.length > 0 ? (
              recentReservations.map((reservation, idx) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 hover:-translate-y-0.5 transition-all cursor-pointer border border-transparent hover:border-purple-500/20"
                  onClick={() => navigate(`/customers/${reservation.customer_id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {reservation.customer?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-white">{reservation.customer?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-slate-400">Room {reservation.room?.room_number || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-300">
                      {new Date(reservation.check_in_date).toLocaleDateString()}
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active reservations</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bills */}
        <div className="glass-card fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Receipt className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Recent Bills</h2>
            </div>
            <button
              onClick={() => navigate('/bills')}
              className="px-4 py-2 text-sm font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentBills.length > 0 ? (
              recentBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 hover:-translate-y-0.5 transition-all cursor-pointer border border-transparent hover:border-purple-500/20"
                  onClick={() => navigate(`/customers/${bill.customer_id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                      {bill.customer?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-white">{bill.customer?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-slate-400">{new Date(bill.bill_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white mb-1">₹{bill.total_amount.toLocaleString()}</p>
                    {getBillStatusBadge(bill.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No bills yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card fade-in" style={{ animationDelay: '0.6s', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/customers')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
            <Users className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Add Customer</span>
          </button>

          <button
            onClick={() => navigate('/reservations')}
            className="px-6 py-3 bg-slate-800 border border-purple-500/30 rounded-xl font-semibold text-purple-400 hover:bg-slate-700 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex items-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            New Reservation
          </button>

          <button
            onClick={() => navigate('/bills')}
            className="px-6 py-3 bg-slate-800 border border-purple-500/30 rounded-xl font-semibold text-purple-400 hover:bg-slate-700 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex items-center gap-2"
          >
            <Receipt className="w-5 h-5" />
            View Bills
          </button>

          <button
            onClick={() => navigate('/rooms')}
            className="px-6 py-3 bg-slate-800 border border-purple-500/30 rounded-xl font-semibold text-purple-400 hover:bg-slate-700 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex items-center gap-2"
          >
            <Building2 className="w-5 h-5" />
            Manage Rooms
          </button>
        </div>
      </div>
    </div>
  )
}
