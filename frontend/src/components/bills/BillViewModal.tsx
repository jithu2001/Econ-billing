import { useState, useEffect, useRef } from 'react'
import { X, Printer, Calendar, FileText, CheckCircle } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import type { Bill, Customer, Settings } from '../../types'
import { customerService, settingsService } from '@/services'
import BillPrint from './BillPrint'

interface BillViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: Bill | null
}

export default function BillViewModal({ open, onOpenChange, bill }: BillViewModalProps) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [settings, setSettings] = useState<Settings>({
    lodge_name: 'Econ',
    address: '',
    phone: '',
    gst_number: '',
    state_name: '',
    state_code: '',
    gst_invoice_prefix: 'GST',
    gst_invoice_next_number: 1,
    non_gst_invoice_prefix: 'INV',
    non_gst_invoice_next_number: 1,
  })
  const [loading, setLoading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bill && open) {
      loadData()
    }
  }, [bill, open])

  const loadData = async () => {
    if (!bill) return
    setLoading(true)
    try {
      const [customerData, settingsData] = await Promise.all([
        customerService.getById(bill.customer_id),
        settingsService.get(),
      ])
      setCustomer(customerData)
      setSettings(settingsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Bill-${bill?.id?.slice(0, 8) || 'invoice'}`,
  })

  if (!bill) return null

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-600 border-gray-300',
      FINALIZED: 'bg-blue-50 text-blue-600 border-blue-200',
      PAID: 'bg-green-50 text-green-600 border-green-200',
      UNPAID: 'bg-red-50 text-red-600 border-red-200',
    }
    return styles[status] || styles.DRAFT
  }

  return (
    <>
      {/* Modal Backdrop */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-xl">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {bill.is_gst_bill ? 'GST Invoice' : 'Invoice'}
                    </h2>
                    <p className="text-sm text-gray-500 font-mono">{bill.invoice_number || `#${bill.id.slice(0, 8)}`}</p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="spinner" />
                  </div>
                ) : (
                  <>
                    {/* Bill Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                          <Calendar className="w-4 h-4" />
                          Bill Date
                        </div>
                        <p className="text-gray-900 font-medium">
                          {new Date(bill.bill_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-gray-500 text-sm mb-1">Status</div>
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border ${getStatusStyle(bill.status)}`}>
                          {bill.status === 'PAID' && <CheckCircle className="w-3 h-3" />}
                          {bill.status}
                        </span>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-gray-500 text-sm mb-1">Customer</div>
                        <p className="text-gray-900 font-medium">{customer?.full_name || 'Loading...'}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-gray-500 text-sm mb-1">Bill Type</div>
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm">
                          {bill.bill_type}
                        </span>
                      </div>
                    </div>

                    {/* Line Items */}
                    {bill.line_items && bill.line_items.length > 0 && (
                      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        <div className="px-4 py-3 border-b border-gray-200">
                          <h3 className="text-sm font-medium text-gray-700">Line Items</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {bill.line_items.map((item) => (
                            <div key={item.id} className="flex justify-between px-4 py-3">
                              <span className="text-gray-600">{item.description}</span>
                              <span className="text-gray-900 font-medium">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Amount Breakdown */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-700">₹{bill.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      {bill.tax_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Tax (GST)</span>
                          <span className="text-gray-700">₹{bill.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {bill.discount_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Discount</span>
                          <span className="text-red-600">-₹{bill.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-700">Total Amount</span>
                          <span className="text-lg font-bold text-gray-900">₹{bill.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    {bill.reservation_id && (
                      <p className="text-sm text-gray-500">
                        Linked to Reservation: #{bill.reservation_id.slice(0, 8)}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => onOpenChange(false)}
                  className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePrint()}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gray-900 rounded-xl font-semibold text-white hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Component */}
      <div className="hidden">
        <BillPrint
          ref={printRef}
          bill={bill}
          customer={customer}
          settings={settings}
          billNumber={1}
        />
      </div>
    </>
  )
}
