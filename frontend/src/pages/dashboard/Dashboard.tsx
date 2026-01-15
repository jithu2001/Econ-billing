import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Users, Building2, Calendar, Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
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
      // Fetch all data in parallel
      const [customersData, roomsData, reservationsData] = await Promise.all([
        customerService.getAll(),
        roomService.getAllRooms(),
        reservationService.getAll(),
      ])
      setCustomers(customersData)
      setRooms(roomsData)
      setReservations(reservationsData)

      // Fetch bills for all customers
      const allBills: Bill[] = []
      for (const customer of customersData) {
        try {
          const customerBills = await billService.getByCustomerId(customer.id)
          // Attach customer data to each bill
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

  // Calculate stats
  const stats = {
    totalCustomers: customers.length,
    activeReservations: reservations.filter(r => r.status === 'ACTIVE').length,
    availableRooms: rooms.filter(r => r.status === 'AVAILABLE').length,
    pendingBills: bills.filter(b => b.status === 'DRAFT' || b.status === 'UNPAID' || b.status === 'FINALIZED').length,
  }

  // Get recent reservations (last 3 active ones)
  const recentReservations = reservations
    .filter(r => r.status === 'ACTIVE')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  // Get recent bills (last 5 bills)
  const recentBills = bills
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const getBillStatusBadge = (status: Bill['status']) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      FINALIZED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      UNPAID: 'bg-red-100 text-red-800',
    }

    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Trinity Lodge Management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/customers')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered customers</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/reservations')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeReservations}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently checked-in</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/rooms')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.availableRooms}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for check-in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingBills}</div>
            <p className="text-xs text-muted-foreground mt-1">Unpaid or draft</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Reservations</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/reservations')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReservations.length > 0 ? (
                  recentReservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell className="font-medium">
                        {reservation.customer?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>{reservation.room?.room_number || 'N/A'}</TableCell>
                      <TableCell>{new Date(reservation.check_in_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No active reservations
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Bills */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Bills</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/bills')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBills.length > 0 ? (
                  recentBills.map((bill) => (
                    <TableRow
                      key={bill.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/customers/${bill.customer_id}`)}
                    >
                      <TableCell className="font-medium">
                        {bill.customer?.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>₹{bill.total_amount.toLocaleString()}</TableCell>
                      <TableCell>{getBillStatusBadge(bill.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No bills yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate('/customers')}>
              <Users className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
            <Button variant="outline" onClick={() => navigate('/reservations')}>
              <Calendar className="mr-2 h-4 w-4" />
              New Reservation
            </Button>
            <Button variant="outline" onClick={() => navigate('/customers')}>
              <Receipt className="mr-2 h-4 w-4" />
              Create Bill
            </Button>
            <Button variant="outline" onClick={() => navigate('/rooms')}>
              <Building2 className="mr-2 h-4 w-4" />
              Manage Rooms
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
