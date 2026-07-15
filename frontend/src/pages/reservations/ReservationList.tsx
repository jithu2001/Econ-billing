import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, Building2, LogIn, LogOut, X, Clock, Receipt, CheckCircle2 } from 'lucide-react'
import ReservationForm from '../../components/reservations/ReservationForm'
import { reservationService, customerService, roomService } from '@/services'
import { Avatar, StatCard, StatusBadge, EmptyState, TableSkeleton, PageHeader, Button, SectionCard } from '@/components/common'
import type { Reservation, Customer, Room } from '../../types'
import { handleApiError } from '@/lib/bindings'

function calculateNights(checkIn: string, checkOut: string) {
  const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000)
  return Math.max(nights, 1)
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
    if (!confirm('Are you sure you want to cancel this reservation?')) return
    try {
      await reservationService.cancel(reservationId)
      await loadData()
    } catch (error) {
      console.error('Failed to cancel reservation:', handleApiError(error))
    }
  }

  const handleCheckout = async (reservationId: string) => {
    try {
      await reservationService.checkout(reservationId, { checkout_date: new Date().toISOString().split('T')[0] })
      await loadData()
    } catch (error) {
      console.error('Failed to checkout:', handleApiError(error))
    }
  }

  const activeReservations = reservations.filter(r => r.status === 'ACTIVE')
  const completedReservations = reservations.filter(r => r.status === 'COMPLETED')

  const isCheckedIn = (reservation: Reservation) => reservation.actual_check_in_date != null

  const canCheckInToday = (checkInDate: string, checkOutDate: string) => {
    const today = new Date().toISOString().split('T')[0]
    const inDate = checkInDate?.split('T')[0] || checkInDate
    const outDate = checkOutDate?.split('T')[0] || checkOutDate
    return inDate <= today && today < outDate
  }

  const statCards = [
    { label: 'Total Reservations', value: reservations.length, icon: Calendar, accent: 'primary' as const },
    { label: 'Active', value: activeReservations.length, icon: CheckCircle2, accent: 'green' as const },
    { label: 'Completed', value: completedReservations.length, icon: Clock, accent: 'stone' as const },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reservations"
        subtitle="Manage room bookings and check-ins"
        action={<Button icon={Plus} onClick={() => setIsReservationFormOpen(true)}>New Reservation</Button>}
      />

      <ReservationForm
        open={isReservationFormOpen}
        onOpenChange={setIsReservationFormOpen}
        onSubmit={handleAddReservation}
        customers={customers}
        rooms={rooms.filter(r => r.status === 'AVAILABLE')}
      />

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : (
        <>
          {/* Stats */}
          <div className="stagger-children grid gap-4 md:grid-cols-3">
            {statCards.map((stat, idx) => (
              <StatCard key={stat.label} index={idx} label={stat.label} value={stat.value} icon={stat.icon} accent={stat.accent} />
            ))}
          </div>

          {/* Active */}
          <SectionCard title="Active Reservations" icon={Calendar} iconTint="hsl(var(--status-green)/0.12)">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="col-label px-4 py-3 text-left">Customer</th>
                    <th className="col-label px-4 py-3 text-left">Room</th>
                    <th className="col-label px-4 py-3 text-left">Check-in</th>
                    <th className="col-label px-4 py-3 text-left">Checkout</th>
                    <th className="col-label px-4 py-3 text-left">Nights</th>
                    <th className="col-label px-4 py-3 text-left">Status</th>
                    <th className="col-label px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeReservations.length > 0 ? (
                    activeReservations.map((reservation) => {
                      const checkedIn = isCheckedIn(reservation)
                      return (
                        <tr
                          key={reservation.id}
                          className="border-b border-gray-50"
                          style={checkedIn ? { borderLeft: '4px solid hsl(var(--status-green))', background: 'hsl(152 50% 40% / 0.04)' } : undefined}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={reservation.customer?.full_name} size="md" />
                              <span className="font-medium text-gray-900">{reservation.customer?.full_name || 'Unknown'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Building2 className="h-4 w-4 text-gray-400" /> Room {reservation.room?.room_number || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{new Date(reservation.check_in_date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-gray-600">{reservation.expected_check_out_date ? new Date(reservation.expected_check_out_date).toLocaleDateString() : 'Not set'}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-muted px-3 py-1 text-sm tabular-nums text-gray-600">
                              {reservation.expected_check_out_date ? calculateNights(reservation.check_in_date, reservation.expected_check_out_date) : '-'} nights
                            </span>
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={reservation.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              {!checkedIn && canCheckInToday(reservation.check_in_date, reservation.expected_check_out_date) ? (
                                <>
                                  <IconAction title="Check in" onClick={() => handleCheckin(reservation.id)} variant="green"><LogIn className="h-4 w-4" /></IconAction>
                                  <IconAction title="Cancel reservation" onClick={() => handleCancel(reservation.id)} variant="red"><X className="h-4 w-4" /></IconAction>
                                </>
                              ) : checkedIn ? (
                                <IconAction title="Checkout" onClick={() => handleCheckout(reservation.id)} variant="blue"><LogOut className="h-4 w-4" /></IconAction>
                              ) : (
                                <>
                                  <span className="badge badge-stone"><Clock className="h-3 w-3" /> Future</span>
                                  <IconAction title="Cancel reservation" onClick={() => handleCancel(reservation.id)} variant="red"><X className="h-4 w-4" /></IconAction>
                                </>
                              )}
                              <IconAction title="View bills" onClick={() => navigate(`/customers/${reservation.customer_id}`)} variant="neutral"><Receipt className="h-4 w-4" /></IconAction>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr><td colSpan={7}><EmptyState icon={Calendar} title="No active reservations" hint="New bookings will show up here." /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Completed */}
          <SectionCard title="Recent Completed" icon={Calendar}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="col-label px-4 py-3 text-left">Customer</th>
                    <th className="col-label px-4 py-3 text-left">Room</th>
                    <th className="col-label px-4 py-3 text-left">Check-in</th>
                    <th className="col-label px-4 py-3 text-left">Check-out</th>
                    <th className="col-label px-4 py-3 text-left">Nights</th>
                    <th className="col-label px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedReservations.length > 0 ? (
                    completedReservations.slice(0, 5).map((reservation) => (
                      <tr key={reservation.id} className="border-b border-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={reservation.customer?.full_name} size="md" className="opacity-70" />
                            <span className="font-medium text-gray-600">{reservation.customer?.full_name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">Room {reservation.room?.room_number || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(reservation.check_in_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-500">{reservation.actual_check_out_date ? new Date(reservation.actual_check_out_date).toLocaleDateString() : 'Not set'}</td>
                        <td className="px-4 py-3 tabular-nums text-gray-500">{reservation.actual_check_out_date ? calculateNights(reservation.check_in_date, reservation.actual_check_out_date) : '-'}</td>
                        <td className="px-4 py-3"><StatusBadge status={reservation.status} /></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6}><EmptyState icon={Calendar} title="No completed reservations" /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}

const ACTION_STYLE: Record<string, React.CSSProperties> = {
  green: { background: 'hsl(var(--status-green)/0.10)', borderColor: 'hsl(var(--status-green)/0.3)', color: 'hsl(152 50% 28%)' },
  blue: { background: 'hsl(var(--status-blue)/0.10)', borderColor: 'hsl(var(--status-blue)/0.3)', color: 'hsl(210 65% 35%)' },
  red: { background: 'hsl(var(--status-red)/0.10)', borderColor: 'hsl(var(--status-red)/0.3)', color: 'hsl(5 72% 38%)' },
  neutral: {},
}

function IconAction({ title, onClick, variant, children }: { title: string; onClick: () => void; variant: 'green' | 'blue' | 'red' | 'neutral'; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center rounded-lg border p-2 text-sm font-medium transition-colors ${variant === 'neutral' ? 'bg-muted text-gray-700 hover:bg-gray-200' : 'hover:brightness-95'}`}
      style={ACTION_STYLE[variant]}
    >
      {children}
    </button>
  )
}
