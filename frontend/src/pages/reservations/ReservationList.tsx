import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar, User, Building2, Receipt } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import ReservationForm from '../../components/reservations/ReservationForm'
import { reservationService, customerService, roomService } from '@/services'
import type { Reservation, Customer, Room } from '../../types'
import { handleApiError } from '@/lib/api'

const getStatusBadge = (status: Reservation['status']) => {
  const colors = {
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}>
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
    // Check if the reservation has an actual check-in date
    return reservation.actual_check_in_date != null
  }

  const canCheckInToday = (checkInDate: string, checkOutDate: string) => {
    const today = new Date().toISOString().split('T')[0]
    // Normalize dates to YYYY-MM-DD format (remove any time component)
    const normalizedCheckIn = checkInDate?.split('T')[0] || checkInDate
    const normalizedCheckOut = checkOutDate?.split('T')[0] || checkOutDate

    // Can check in if today is on or after check-in date AND before checkout date
    const result = normalizedCheckIn <= today && today < normalizedCheckOut

    console.log('Check-in validation:', {
      today,
      checkInDate: normalizedCheckIn,
      checkOutDate: normalizedCheckOut,
      canCheckIn: result
    })

    return result
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(nights, 1) // At least 1 night
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading reservations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">Manage room bookings and check-ins</p>
        </div>
        <Button onClick={() => setIsReservationFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
        </Button>
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeReservations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{completedReservations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Expected Checkout</TableHead>
                <TableHead>Nights</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeReservations.length > 0 ? (
                activeReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {reservation.customer?.full_name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {reservation.room?.room_number || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(reservation.check_in_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {reservation.expected_check_out_date
                        ? new Date(reservation.expected_check_out_date).toLocaleDateString()
                        : 'Not set'}
                    </TableCell>
                    <TableCell>
                      {reservation.expected_check_out_date
                        ? calculateNights(reservation.check_in_date, reservation.expected_check_out_date)
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!isCheckedIn(reservation) && canCheckInToday(reservation.check_in_date, reservation.expected_check_out_date) ? (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleCheckin(reservation.id)}
                            >
                              Check In
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(reservation.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : isCheckedIn(reservation) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCheckout(reservation.id)}
                          >
                            Checkout
                          </Button>
                        ) : (
                          <>
                            <span className="text-sm text-muted-foreground">Future booking</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(reservation.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" onClick={() => navigate(`/customers/${reservation.customer_id}`)}>
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No active reservations
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Completed Reservations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Completed Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Nights</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedReservations.length > 0 ? (
                completedReservations.slice(0, 5).map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      {reservation.customer?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>{reservation.room?.room_number || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(reservation.check_in_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {reservation.actual_check_out_date
                        ? new Date(reservation.actual_check_out_date).toLocaleDateString()
                        : 'Not set'}
                    </TableCell>
                    <TableCell>
                      {reservation.actual_check_out_date
                        ? calculateNights(reservation.check_in_date, reservation.actual_check_out_date)
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No completed reservations
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
