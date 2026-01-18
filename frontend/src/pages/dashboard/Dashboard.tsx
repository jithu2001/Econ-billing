import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Users, Building2, Calendar, Receipt, ArrowRight, TrendingUp } from 'lucide-react'
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
      DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
      FINALIZED: 'bg-blue-50 text-blue-600 border-blue-200',
      PAID: 'bg-green-50 text-green-600 border-green-200',
      UNPAID: 'bg-red-50 text-red-600 border-red-200',
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'PAID' ? 'bg-green-500' : status === 'UNPAID' ? 'bg-red-500' : status === 'FINALIZED' ? 'bg-blue-500' : 'bg-gray-400'}`} />
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
      desc: 'Registered customers',
      href: '/customers'
    },
    {
      title: 'Active Reservations',
      value: stats.activeReservations,
      icon: Calendar,
      desc: 'Currently checked-in',
      href: '/reservations'
    },
    {
      title: 'Available Rooms',
      value: stats.availableRooms,
      icon: Building2,
      desc: 'Ready for check-in',
      href: '/rooms'
    },
    {
      title: 'Pending Bills',
      value: stats.pendingBills,
      icon: Receipt,
      desc: 'Awaiting payment',
      href: '/bills'
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="slide-in-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your property overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              onClick={() => navigate(stat.href)}
              className="card fade-in cursor-pointer group"
              style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                  <p className="text-xs text-gray-400 mt-1">{stat.desc}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Reservations */}
        <div className="card fade-in" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reservations</h2>
            <button
              onClick={() => navigate('/reservations')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {recentReservations.length > 0 ? (
              recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/customers/${reservation.customer_id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium text-sm">
                      {reservation.customer?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{reservation.customer?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">Room {reservation.room?.room_number || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(reservation.check_in_date).toLocaleDateString()}
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-medium">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Active
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No active reservations</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bills */}
        <div className="card fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bills</h2>
            <button
              onClick={() => navigate('/bills')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
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
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/customers/${bill.customer_id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-medium text-sm">
                      {bill.customer?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{bill.customer?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{new Date(bill.bill_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900 mb-1">₹{bill.total_amount.toLocaleString()}</p>
                    {getBillStatusBadge(bill.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No bills yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card fade-in" style={{ animationDelay: '0.6s', opacity: 0 }}>
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/customers')}
            className="px-5 py-2.5 bg-gray-900 rounded-lg font-medium text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Add Customer
          </button>

          <button
            onClick={() => navigate('/reservations')}
            className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            New Reservation
          </button>

          <button
            onClick={() => navigate('/bills')}
            className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            View Bills
          </button>

          <button
            onClick={() => navigate('/rooms')}
            className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            Manage Rooms
          </button>
        </div>
      </div>
    </div>
  )
}