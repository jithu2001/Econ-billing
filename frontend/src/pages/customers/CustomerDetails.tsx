import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, IdCard, Plus, Receipt, CreditCard, Calendar, Eye, FileText, Wallet } from 'lucide-react'
import BillModal from '../../components/bills/BillModal'
import BillViewModal from '../../components/bills/BillViewModal'
import PaymentForm from '../../components/payments/PaymentForm'
import ReservationForm from '../../components/reservations/ReservationForm'
import { type BillData } from '../../components/bills/BillEditor'
import { customerService, reservationService, billService, roomService } from '@/services'
import { handleApiError } from '@/lib/bindings'
import { Avatar, StatusBadge, StatCard, EmptyState, Button } from '@/components/common'
import type { Bill, Customer, Reservation, Room, Payment } from '../../types'

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
  const [editingBill, setEditingBill] = useState<Bill | null>(null)

  useEffect(() => {
    if (id) loadCustomerData()
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
      <div className="flex h-96 items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">Customer not found</h2>
        <Button onClick={() => navigate('/customers')}>Back to Customers</Button>
      </div>
    )
  }

  const handleCreateBill = (reservationId?: string) => {
    setEditingBill(null)
    setSelectedReservationId(reservationId)
    setIsBillModalOpen(true)
  }

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill)
    setSelectedReservationId(bill.reservation_id)
    setIsBillModalOpen(true)
  }

  const handleBillSubmit = async (billData: BillData) => {
    if (!customer) return
    try {
      const billRequest = {
        customer_id: customer.id,
        reservation_id: selectedReservationId,
        bill_type: billData.billType as 'ROOM' | 'WALK_IN' | 'FOOD' | 'MANUAL',
        bill_date: new Date().toISOString().split('T')[0],
        is_gst_bill: billData.enableGST,
        gst_inclusive: billData.gstInclusive,
        subtotal: billData.subtotal,
        tax_amount: billData.taxAmount,
        discount_amount: billData.discountAmount,
        total_amount: billData.totalAmount,
        status: 'FINALIZED' as const,
        line_items: billData.lineItems.map(item => ({ description: item.description, amount: item.amount })),
        arrival_datetime: billData.arrivalDateTime,
        departure_datetime: billData.departureDateTime,
      }
      if (editingBill) {
        await billService.update(editingBill.id, { ...billRequest, customer_id: editingBill.customer_id, reservation_id: editingBill.reservation_id } as any)
      } else {
        await billService.create(billRequest as any)
      }
      await loadCustomerData()
      setIsBillModalOpen(false)
      setSelectedReservationId(undefined)
      setEditingBill(null)
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
      await billService.createPayment(selectedBill.id, {
        amount: payment.amount,
        payment_method: payment.payment_method,
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reservations', label: 'Reservations' },
    { id: 'bills', label: 'Bills' },
  ]

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/customers')}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </button>

      {/* Warm banner header */}
      <div
        className="animate-fade-up overflow-hidden rounded-2xl border p-6"
        style={{ background: 'linear-gradient(120deg, hsl(28 60% 95%), hsl(36 30% 97%))' }}
      >
        <div className="flex items-center gap-4">
          <Avatar name={customer.full_name} size="xl" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{customer.full_name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-gray-400" />{customer.phone}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />{customer.address}</span>
              <span className="flex items-center gap-1.5"><IdCard className="h-4 w-4 text-gray-400" />{customer.id_proof_type} · {customer.id_proof_number}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BillModal
        open={isBillModalOpen}
        onOpenChange={setIsBillModalOpen}
        onSubmit={handleBillSubmit}
        reservationId={selectedReservationId}
        reservation={selectedReservationId ? reservations.find(r => r.id === selectedReservationId) : undefined}
        billType={editingBill ? editingBill.bill_type : (selectedReservationId ? 'ROOM' : 'MANUAL')}
        existingBill={editingBill ?? undefined}
      />
      <BillViewModal open={isBillViewOpen} onOpenChange={setIsBillViewOpen} bill={selectedBill} onEdit={handleEditBill} />
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

      {/* Pill tabs */}
      <div className="inline-flex gap-1 rounded-xl bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content (re-animates on switch) */}
      <div key={activeTab} className="animate-fade-up">
        {activeTab === 'overview' && (
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="Total Reservations" value={reservations.length} icon={Calendar} accent="blue" />
            <StatCard label="Total Bills" value={bills.length} icon={Receipt} accent="primary" />
            <StatCard
              label="Total Amount"
              value={`₹${bills.reduce((sum, b) => sum + b.total_amount, 0).toLocaleString()}`}
              icon={Wallet}
              accent="green"
            />
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="card">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Reservations</h2>
              <Button icon={Plus} className="px-4 py-2 text-sm" onClick={() => setIsReservationFormOpen(true)}>New Reservation</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="col-label px-4 py-3 text-left">Check-in</th>
                    <th className="col-label px-4 py-3 text-left">Check-out</th>
                    <th className="col-label px-4 py-3 text-left">Status</th>
                    <th className="col-label px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length === 0 ? (
                    <tr><td colSpan={4}><EmptyState icon={Calendar} title="No reservations yet" hint="Create a reservation for this customer." /></td></tr>
                  ) : (
                    reservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b border-gray-50">
                        <td className="px-4 py-3 text-gray-900">{new Date(reservation.check_in_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-900">{reservation.expected_check_out_date ? new Date(reservation.expected_check_out_date).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-4 py-3"><StatusBadge status={reservation.status} /></td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleCreateBill(reservation.id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                          >
                            <Receipt className="h-4 w-4" /> Generate Bill
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bills' && (
          <div className="card">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bills</h2>
                <p className="text-sm text-gray-500">All bills with and without reservations</p>
              </div>
              <Button icon={Plus} className="px-4 py-2 text-sm" onClick={() => handleCreateBill()}>Create Bill</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="col-label px-4 py-3 text-left">Bill Date</th>
                    <th className="col-label px-4 py-3 text-left">Type</th>
                    <th className="col-label px-4 py-3 text-left">Amount</th>
                    <th className="col-label px-4 py-3 text-left">Status</th>
                    <th className="col-label px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 ? (
                    <tr><td colSpan={5}><EmptyState icon={FileText} title="No bills yet" hint="Generate the first bill for this customer." /></td></tr>
                  ) : (
                    bills.map((bill) => (
                      <tr key={bill.id} className="border-b border-gray-50">
                        <td className="px-4 py-3 text-gray-900">{new Date(bill.bill_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-md bg-muted px-2 py-1 text-sm text-gray-700">{bill.bill_type}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold tabular-nums text-gray-900">₹{bill.total_amount.toLocaleString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={bill.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleViewBill(bill)} aria-label="View bill"
                              className="rounded-lg bg-muted p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAddPayment(bill)}
                              disabled={bill.status === 'PAID'}
                              className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                              style={{ background: 'hsl(var(--status-green)/0.10)', borderColor: 'hsl(var(--status-green)/0.3)', color: 'hsl(152 50% 28%)' }}
                            >
                              <CreditCard className="h-4 w-4" /> Add Payment
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
