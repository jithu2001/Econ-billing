import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, IdCard, Plus, Receipt, CreditCard, Calendar, Eye, FileText, Wallet } from 'lucide-react'
import BillModal from '../../components/bills/BillModal'
import BillViewModal from '../../components/bills/BillViewModal'
import PaymentForm from '../../components/payments/PaymentForm'
import ReservationForm from '../../components/reservations/ReservationForm'
import { type BillData } from '../../components/bills/BillEditor'
import { customerService, reservationService, billService, roomService } from '@/services'
import { handleApiError } from '@/lib/api'
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
        <div className="spinner" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Customer not found</h2>
        <button
          onClick={() => navigate('/customers')}
          className="px-5 py-2.5 bg-gray-900 rounded-lg font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Back to Customers
        </button>
      </div>
    )
  }

  const handleCreateBill = (reservationId?: string) => {
    setSelectedReservationId(reservationId)
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reservations', label: 'Reservations' },
    { id: 'bills', label: 'Bills' },
  ]

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      CONFIRMED: 'bg-blue-50 text-blue-600 border-blue-200',
      CHECKED_IN: 'bg-green-50 text-green-600 border-green-200',
      CHECKED_OUT: 'bg-gray-100 text-gray-600 border-gray-200',
      CANCELLED: 'bg-red-50 text-red-600 border-red-200',
      ACTIVE: 'bg-green-50 text-green-600 border-green-200',
      DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
      FINALIZED: 'bg-blue-50 text-blue-600 border-blue-200',
      PAID: 'bg-green-50 text-green-600 border-green-200',
      UNPAID: 'bg-red-50 text-red-600 border-red-200',
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'PAID' || status === 'CHECKED_IN' || status === 'ACTIVE' ? 'bg-green-500' : status === 'CONFIRMED' || status === 'FINALIZED' ? 'bg-blue-500' : status === 'UNPAID' || status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-400'}`} />
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white text-lg font-bold">
              {customer.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.full_name}</h1>
              <p className="text-gray-500">Customer details and history</p>
            </div>
          </div>
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
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Phone className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Phone</div>
              <div className="text-base font-medium text-gray-900">{customer.phone}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Address</div>
              <div className="text-base font-medium text-gray-900">{customer.address}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <IdCard className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">ID Proof</div>
              <div className="text-base font-medium text-gray-900">{customer.id_proof_type}</div>
              <div className="text-sm text-gray-500">{customer.id_proof_number}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Total Reservations', value: reservations.length, icon: Calendar },
              { label: 'Total Bills', value: bills.length, icon: Receipt },
              { label: 'Total Amount', value: `₹${bills.reduce((sum, bill) => sum + bill.total_amount, 0).toFixed(2)}`, icon: Wallet },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Reservations</h2>
              <button
                onClick={() => setIsReservationFormOpen(true)}
                className="px-4 py-2 bg-gray-900 rounded-lg font-medium text-white text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Reservation
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-out</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center">
                        <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-gray-500">No reservations found</p>
                      </td>
                    </tr>
                  ) : (
                    reservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-900">{new Date(reservation.check_in_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-gray-900">{reservation.expected_check_out_date ? new Date(reservation.expected_check_out_date).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-4 py-3">{getStatusBadge(reservation.status)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleCreateBill(reservation.id)}
                            className="px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                          >
                            <Receipt className="h-4 w-4" />
                            Generate Bill
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

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bills</h2>
                <p className="text-sm text-gray-500">All bills with and without reservations</p>
              </div>
              <button
                onClick={() => handleCreateBill()}
                className="px-4 py-2 bg-gray-900 rounded-lg font-medium text-white text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Bill
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-gray-500">No bills found</p>
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-900">{new Date(bill.bill_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                            {bill.bill_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">₹{bill.total_amount.toFixed(2)}</td>
                        <td className="px-4 py-3">{getStatusBadge(bill.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewBill(bill)}
                              className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAddPayment(bill)}
                              disabled={bill.status === 'PAID'}
                              className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CreditCard className="h-4 w-4" />
                              Add Payment
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
