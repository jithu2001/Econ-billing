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
        <div className="spinner" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <h2 className="text-2xl font-bold text-slate-200">Customer not found</h2>
        <button
          onClick={() => navigate('/customers')}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all"
        >
          Back to Customers
        </button>
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reservations', label: 'Reservations' },
    { id: 'bills', label: 'Bills' },
    { id: 'payments', label: 'Payments' },
  ]

  const getStatusBadge = (status: string, _type: 'reservation' | 'bill') => {
    const styles: Record<string, string> = {
      // Reservation statuses
      CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      CHECKED_IN: 'bg-green-500/20 text-green-400 border-green-500/30',
      CHECKED_OUT: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
      // Bill statuses
      DRAFT: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      FINALIZED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      PAID: 'bg-green-500/20 text-green-400 border-green-500/30',
      UNPAID: 'bg-red-500/20 text-red-400 border-red-500/30',
    }

    return (
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border ${styles[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
        <div className={`w-2 h-2 rounded-full ${status === 'PAID' || status === 'CHECKED_IN' ? 'bg-green-400 animate-pulse' : status === 'CONFIRMED' || status === 'FINALIZED' ? 'bg-blue-400' : 'bg-slate-400'}`} />
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 slide-in-left">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-purple-500/30 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/30">
              {customer.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">{customer.full_name}</h1>
              <p className="text-slate-400">Customer details and history</p>
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
      <div className="glass-card p-6 rounded-xl fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">Customer Information</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Phone className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-400 mb-1">Phone</div>
              <div className="text-base font-medium text-slate-200">{customer.phone}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <MapPin className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-400 mb-1">Address</div>
              <div className="text-base font-medium text-slate-200">{customer.address}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <IdCard className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-400 mb-1">ID Proof</div>
              <div className="text-base font-medium text-slate-200">{customer.id_proof_type}</div>
              <div className="text-sm text-slate-400">{customer.id_proof_number}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4 fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-slate-800/50 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
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
              { label: 'Total Reservations', value: reservations.length, icon: Calendar, color: 'purple' },
              { label: 'Total Bills', value: bills.length, icon: Receipt, color: 'pink' },
              { label: 'Total Amount', value: `₹${bills.reduce((sum, bill) => sum + bill.total_amount, 0).toFixed(2)}`, icon: Wallet, color: 'teal' },
            ].map((stat, idx) => {
              const Icon = stat.icon
              const colorClasses = {
                purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', shadow: 'group-hover:shadow-purple-500/30' },
                pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', shadow: 'group-hover:shadow-pink-500/30' },
                teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', shadow: 'group-hover:shadow-teal-500/30' },
              }
              const colors = colorClasses[stat.color as keyof typeof colorClasses]
              return (
                <div
                  key={stat.label}
                  className="glass-card p-6 rounded-xl group relative overflow-hidden fade-in"
                  style={{ animationDelay: `${0.3 + idx * 0.1}s`, opacity: 0 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <div className="relative z-10">
                    <div className={`p-3 ${colors.bg} rounded-xl inline-block mb-4 ${colors.shadow} transition-all`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${colors.text}`}>{stat.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-200">Reservations</h2>
              <button
                onClick={() => setIsReservationFormOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium text-white text-sm hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Reservation
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Check-in</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Check-out</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Calendar className="w-12 h-12 text-slate-600" />
                          <p className="text-slate-400">No reservations found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reservations.map((reservation) => (
                      <tr key={reservation.id} className="group hover:bg-slate-800/30 transition-all">
                        <td className="px-6 py-4 text-slate-300">{new Date(reservation.check_in_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-slate-300">{reservation.expected_check_out_date ? new Date(reservation.expected_check_out_date).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4">{getStatusBadge(reservation.status, 'reservation')}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleCreateBill(reservation.id)}
                            className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 text-sm font-medium hover:bg-purple-500/20 transition-all flex items-center gap-2"
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
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-200">Bills</h2>
                  <p className="text-sm text-slate-400">All bills with and without reservations</p>
                </div>
                <button
                  onClick={() => handleCreateBill()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium text-white text-sm hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Bill
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Bill Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="w-12 h-12 text-slate-600" />
                          <p className="text-slate-400">No bills found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    bills.map((bill) => (
                      <tr key={bill.id} className="group hover:bg-slate-800/30 transition-all">
                        <td className="px-6 py-4 text-slate-300">{new Date(bill.bill_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm">
                            {bill.bill_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">₹{bill.total_amount.toFixed(2)}</td>
                        <td className="px-6 py-4">{getStatusBadge(bill.status, 'bill')}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewBill(bill)}
                              className="p-2 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAddPayment(bill)}
                              disabled={bill.status === 'PAID'}
                              className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium hover:bg-green-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-200">Payment History</h2>
              <p className="text-sm text-slate-400">All payments made by this customer</p>
            </div>
            {customerPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <CreditCard className="w-12 h-12 text-slate-600" />
                <p className="text-slate-400">No payments recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Bill ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-purple-400 uppercase tracking-wider">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {customerPayments.map((payment) => (
                      <tr key={payment.id} className="group hover:bg-slate-800/30 transition-all">
                        <td className="px-6 py-4 text-slate-300">{new Date(payment.payment_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-400">{payment.bill_id}</td>
                        <td className="px-6 py-4 font-semibold text-white">₹{payment.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm">
                            {payment.payment_method}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
