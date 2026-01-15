import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, IdCard, Plus, Receipt, CreditCard } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import BillModal from '../../components/bills/BillModal'
import BillViewModal from '../../components/bills/BillViewModal'
import PaymentForm from '../../components/payments/PaymentForm'
import ReservationForm from '../../components/reservations/ReservationForm'
import { type BillData } from '../../components/bills/BillEditor'
import { customerService, reservationService, billService, roomService } from '@/services'
import { handleApiError } from '@/lib/api'
import type { Bill, Payment, Customer, Reservation, Room } from '../../types'

export default function CustomerDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isBillModalOpen, setIsBillModalOpen] = useState(false)
  const [isBillViewOpen, setIsBillViewOpen] = useState(false)
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false)
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false)
  const [selectedReservationId, setSelectedReservationId] = useState<string | undefined>()
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

  useEffect(() => {
    if (id) {
      loadCustomerData()
    }
  }, [id])

  const loadCustomerData = async () => {
    if (!id) return

    try {
      setLoading(true)
      const [customerData, reservationsData, billsData, roomsData] = await Promise.all([
        customerService.getById(id),
        reservationService.getAll(),
        billService.getByCustomerId(id),
        roomService.getAllRooms(),
      ])
      setCustomer(customerData)
      // Filter reservations for this customer
      setReservations(reservationsData.filter(r => r.customer_id === id))
      setBills(billsData)
      setRooms(roomsData)
    } catch (error) {
      console.error('Failed to load customer data:', handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading customer data...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Customer not found</h2>
          <Button onClick={() => navigate('/customers')} className="mt-4">
            Back to Customers
          </Button>
        </div>
      </div>
    )
  }

  const customerPayments: Payment[] = []

  const handleCreateBill = (reservationId?: string) => {
    setSelectedReservationId(reservationId)
    setIsBillModalOpen(true)
  }

  const handleBillSubmit = async (billData: BillData) => {
    if (!customer) return

    try {
      // Create bill via API with complete data
      const billRequest = {
        customer_id: customer.id,
        reservation_id: selectedReservationId,
        bill_type: billData.billType as 'ROOM' | 'WALK_IN' | 'FOOD' | 'MANUAL',
        bill_date: new Date().toISOString().split('T')[0],
        subtotal: billData.subtotal,
        tax_amount: billData.taxAmount,
        discount_amount: billData.discountAmount,
        total_amount: billData.totalAmount,
        status: 'FINALIZED' as const,
        line_items: billData.lineItems.map(item => ({
          description: item.description,
          amount: item.amount,
        })),
      }

      await billService.create(billRequest as any)
      await loadCustomerData()
      setIsBillModalOpen(false)
      setSelectedReservationId(undefined)
    } catch (error) {
      console.error('Failed to create bill:', handleApiError(error))
      throw error
    }
  }

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill)
    setIsBillViewOpen(true)
  }

  const handleAddPayment = (bill: Bill) => {
    setSelectedBill(bill)
    setIsPaymentFormOpen(true)
  }

  const handlePaymentSubmit = async (payment: Omit<Payment, 'id'>) => {
    try {
      if (!selectedBill) return

      // Create payment via API
      await billService.createPayment(selectedBill.id, {
        amount: payment.amount,
        payment_method: payment.payment_method as 'CASH' | 'CARD' | 'UPI',
        payment_date: payment.payment_date,
      })

      await loadCustomerData()
      setIsPaymentFormOpen(false)
      setSelectedBill(null)
    } catch (error) {
      console.error('Failed to add payment:', handleApiError(error))
      throw error
    }
  }

  const handleReservationSubmit = async (reservationData: any) => {
    try {
      await reservationService.create(reservationData)
      await loadCustomerData()
      setIsReservationFormOpen(false)
    } catch (error) {
      console.error('Failed to create reservation:', handleApiError(error))
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{customer.full_name}</h1>
          <p className="text-muted-foreground">Customer details and history</p>
        </div>
      </div>

      <BillModal
        open={isBillModalOpen}
        onOpenChange={setIsBillModalOpen}
        onSubmit={handleBillSubmit}
        reservationId={selectedReservationId}
        reservation={selectedReservationId ? reservations.find(r => r.id === selectedReservationId) : undefined}
        billType={selectedReservationId ? 'ROOM' : 'MANUAL'}
      />

      <BillViewModal
        open={isBillViewOpen}
        onOpenChange={setIsBillViewOpen}
        bill={selectedBill}
      />

      {selectedBill && (
        <PaymentForm
          open={isPaymentFormOpen}
          onOpenChange={setIsPaymentFormOpen}
          onSubmit={handlePaymentSubmit}
          billId={selectedBill.id}
          billAmount={selectedBill.total_amount}
        />
      )}

      <ReservationForm
        open={isReservationFormOpen}
        onOpenChange={setIsReservationFormOpen}
        onSubmit={handleReservationSubmit}
        customers={[customer]}
        rooms={rooms.filter(r => r.status === 'AVAILABLE')}
        preselectedCustomerId={customer.id}
      />

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Phone</div>
                <div className="text-base font-medium">{customer.phone}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Address</div>
                <div className="text-base font-medium">{customer.address}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IdCard className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">ID Proof</div>
                <div className="text-base font-medium">{customer.id_proof_type}</div>
                <div className="text-sm text-muted-foreground">{customer.id_proof_number}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs>
        <TabsList>
          <TabsTrigger active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'reservations'} onClick={() => setActiveTab('reservations')}>
            Reservations
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'bills'} onClick={() => setActiveTab('bills')}>
            Bills
          </TabsTrigger>
          <TabsTrigger active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
            Payments
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        {activeTab === 'overview' && (<TabsContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reservations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bills.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{bills.reduce((sum, bill) => sum + bill.total_amount, 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>)}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (<TabsContent>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reservations</CardTitle>
                <Button size="sm" onClick={() => setIsReservationFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Reservation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No reservations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    reservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>{new Date(reservation.check_in_date).toLocaleDateString()}</TableCell>
                        <TableCell>{reservation.expected_check_out_date ? new Date(reservation.expected_check_out_date).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                            {reservation.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleCreateBill(reservation.id)}>
                            <Receipt className="mr-2 h-4 w-4" />
                            Generate Bill
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>)}

        {/* Bills Tab */}
        {activeTab === 'bills' && (<TabsContent>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bills</CardTitle>
                <Button size="sm" onClick={() => handleCreateBill()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Bill
                </Button>
              </div>
              <CardDescription>
                All bills with and without reservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bills.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No bills found
                      </TableCell>
                    </TableRow>
                  ) : (
                    bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>{new Date(bill.bill_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                            {bill.bill_type}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">₹{bill.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            bill.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            bill.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bill.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewBill(bill)}>
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddPayment(bill)}
                              disabled={bill.status === 'PAID'}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              Add Payment
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>)}

        {/* Payments Tab */}
        {activeTab === 'payments' && (<TabsContent>
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payments made by this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {customerPayments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No payments recorded yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Bill ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-sm">{payment.bill_id}</TableCell>
                        <TableCell className="font-medium">₹{payment.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                            {payment.payment_method}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>)}
      </Tabs>
    </div>
  )
}
