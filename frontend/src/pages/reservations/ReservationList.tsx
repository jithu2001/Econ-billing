import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, User, Building2, Receipt, LogIn, LogOut, X, Clock } from 'lucide-react'
import ReservationForm from '../../components/reservations/ReservationForm'
import { reservationService, customerService, roomService } from '@/services'
import type { Reservation, Customer, Room } from '../../types'
import { handleApiError } from '@/lib/api'

const getStatusBadge = (status: Reservation['status']) => {
  const styles = {
    ACTIVE: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30',
      dot: 'bg-green-400'
    },
    COMPLETED: {
      bg: 'bg-slate-500/20',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      dot: 'bg-slate-400'
    },
    CANCELLED: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      dot: 'bg-red-400'
    },
  }

  const style = styles[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  )
}

export default function ReservationList() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [reservationsData, customersData, roomsData] = await Promise.all([
        reservationService.getAll(),
        customerService.getAll(),
        roomService.getAllRooms(),
      ])
      setReservations(reservationsData)
      setCustomers(customersData)
      setRooms(roomsData)
    } catch (error) {
      console.error('Failed to load data:', handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleAddReservation = async (reservationData: any) => {
    await reservationService.create(reservationData)
    await loadData()
  }

  const handleCheckin = async (reservationId: string) => {
    try {
      await reservationService.checkin(reservationId)
      await loadData()
    } catch (error) {
      console.error('Failed to check in:', handleApiError(error))
    }
  }

  const handleCancel = async (reservationId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return
    }
    try {
      await reservationService.cancel(reservationId)
      await loadData()
    } catch (error) {
      console.error('Failed to cancel reservation:', handleApiError(error))
    }
  }

  const handleCheckout = async (reservationId: string) => {
    try {
      await reservationService.checkout(reservationId, {
        checkout_date: new Date().toISOString().split('T')[0],
      })
      await loadData()
    } catch (error) {
      console.error('Failed to checkout:', handleApiError(error))
    }
  }

  const activeReservations = reservations.filter(r => r.status === 'ACTIVE')
  const completedReservations = reservations.filter(r => r.status === 'COMPLETED')

  const isCheckedIn = (reservation: Reservation) => {
    return reservation.actual_check_in_date != null
  }

  const canCheckInToday = (checkInDate: string, checkOutDate: string) => {
    const today = new Date().toISOString().split('T')[0]
    const normalizedCheckIn = checkInDate?.split('T')[0] || checkInDate
    const normalizedCheckOut = checkOutDate?.split('T')[0] || checkOutDate
    return normalizedCheckIn <= today && today < normalizedCheckOut
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(nights, 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  const statCards = [
    { label: 'Total Reservations', value: reservations.length, color: 'purple' },
    { label: 'Active', value: activeReservations.length, color: 'green' },
    { label: 'Completed', value: completedReservations.length, color: 'slate' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between slide-in-left">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold gradient-text">Reservations</h1>
          </div>
          <p className="text-slate-400">Manage room bookings and check-ins</p>
        </div>
        <button
          onClick={() => setIsReservationFormOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
          <Plus className="w-5 h-5 relative z-10" />
          <span className="relative z-10">New Reservation</span>
        </button>
      </div>

      <ReservationForm
        open={isReservationFormOpen}
        onOpenChange={setIsReservationFormOpen}
        onSubmit={handleAddReservation}
        customers={customers}
        rooms={rooms.filter(r => r.status === 'AVAILABLE')}
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat, idx) => (
          <div
            key={stat.label}
            className="glass-card fade-in"
            style={{ animationDelay: `${idx * 0.1}s`, opacity: 0 }}
          >
            <p className="text-sm font-medium text-slate-400 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${
              stat.color === 'purple' ? 'text-white' :
              stat.color === 'green' ? 'text-green-400' : 'text-slate-400'
            }`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Active Reservations */}
      <div className="glass-card fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Calendar className="w-5 h-5 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Active Reservations</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Check-in</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Checkout</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Nights</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {activeReservations.length > 0 ? (
                activeReservations.map((reservation) => (
                  <tr key={reservation.id} className="group hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {reservation.customer?.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-white">{reservation.customer?.full_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        Room {reservation.room?.room_number || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(reservation.check_in_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {reservation.expected_check_out_date
                        ? new Date(reservation.expected_check_out_date).toLocaleDateString()
                        : 'Not set'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300">
                        {reservation.expected_check_out_date
                          ? calculateNights(reservation.check_in_date, reservation.expected_check_out_date)
                          : '-'} nights
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(reservation.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!isCheckedIn(reservation) && canCheckInToday(reservation.check_in_date, reservation.expected_check_out_date) ? (
                          <>
                            <button
                              onClick={() => handleCheckin(reservation.id)}
                              className="px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-sm font-medium text-green-400 hover:bg-green-500/30 transition-all flex items-center gap-1.5"
                            >
                              <LogIn className="w-4 h-4" />
                              Check In
                            </button>
                            <button
                              onClick={() => handleCancel(reservation.id)}
                              className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-1.5"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : isCheckedIn(reservation) ? (
                          <button
                            onClick={() => handleCheckout(reservation.id)}
                            className="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm font-medium text-blue-400 hover:bg-blue-500/30 transition-all flex items-center gap-1.5"
                          >
                            <LogOut className="w-4 h-4" />
                            Checkout
                          </button>
                        ) : (
                          <>
                            <span className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-500 flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              Future
                            </span>
                            <button
                              onClick={() => handleCancel(reservation.id)}
                              className="px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-1.5"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => navigate(`/customers/${reservation.customer_id}`)}
                          className="px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-sm font-medium text-purple-400 hover:bg-slate-700 transition-all"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-500">No active reservations</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Reservations */}
      <div className="glass-card fade-in" style={{ animationDelay: '0.4s', opacity: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-500/10 rounded-lg">
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Recent Completed</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Check-in</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Check-out</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Nights</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {completedReservations.length > 0 ? (
                completedReservations.slice(0, 5).map((reservation) => (
                  <tr key={reservation.id} className="group hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white font-semibold">
                          {reservation.customer?.full_name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-slate-300">{reservation.customer?.full_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">Room {reservation.room?.room_number || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(reservation.check_in_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {reservation.actual_check_out_date
                        ? new Date(reservation.actual_check_out_date).toLocaleDateString()
                        : 'Not set'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {reservation.actual_check_out_date
                        ? calculateNights(reservation.check_in_date, reservation.actual_check_out_date)
                        : '-'}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(reservation.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-500">No completed reservations</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
