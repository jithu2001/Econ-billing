import { forwardRef } from 'react'
import type { Bill, Customer, Settings } from '@/types'
import { gstSplit, formatRate } from '@/lib/gst'

interface BillPrintProps {
  bill: Bill
  customer: Customer | null
  settings: Settings
  billNumber?: number
}

// Convert number to words for Indian currency
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  if (num === 0) return 'Zero'

  const crore = Math.floor(num / 10000000)
  num %= 10000000
  const lakh = Math.floor(num / 100000)
  num %= 100000
  const thousand = Math.floor(num / 1000)
  num %= 1000
  const hundred = Math.floor(num / 100)
  num %= 100
  const ten = Math.floor(num / 10)
  const one = num % 10

  let result = ''

  if (crore > 0) {
    result += (crore < 20 ? ones[crore] : tens[Math.floor(crore / 10)] + ' ' + ones[crore % 10]) + ' Crore '
  }
  if (lakh > 0) {
    result += (lakh < 20 ? ones[lakh] : tens[Math.floor(lakh / 10)] + ' ' + ones[lakh % 10]) + ' Lakh '
  }
  if (thousand > 0) {
    result += (thousand < 20 ? ones[thousand] : tens[Math.floor(thousand / 10)] + ' ' + ones[thousand % 10]) + ' Thousand '
  }
  if (hundred > 0) {
    result += ones[hundred] + ' Hundred '
  }
  if (ten > 0 || one > 0) {
    if (ten < 2) {
      result += ones[ten * 10 + one]
    } else {
      result += tens[ten] + ' ' + ones[one]
    }
  }

  return result.trim()
}

const BillPrint = forwardRef<HTMLDivElement, BillPrintProps>(({ bill, customer, settings, billNumber = 1 }, ref) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const formatDateTime = (value?: string) => {
    if (!value) return ''
    const d = new Date(value)
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const totalInWords = `Rupees ${numberToWords(Math.floor(bill.total_amount))} Only`
  const { cgstAmount, sgstAmount, cgstRate, sgstRate } = gstSplit(bill.subtotal, bill.tax_amount)

  return (
    <div ref={ref} className="bill-print-container bg-white text-black p-10 w-[210mm] min-h-[297mm]" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{settings.lodge_name || 'Lodge Name'}</h1>
          {settings.address && (
            <p className="text-sm text-gray-600 mt-1 max-w-xs">{settings.address}</p>
          )}
          {settings.phone && (
            <p className="text-sm text-gray-600">Tel: {settings.phone}</p>
          )}
        </div>
        <div className="text-right">
          <div className="inline-block px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded">
            {bill.is_gst_bill ? 'TAX INVOICE' : 'INVOICE'}
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-3">{bill.invoice_number || `#${billNumber}`}</p>
          <p className="text-sm text-gray-500">{formatDate(bill.bill_date)}</p>
          {bill.arrival_datetime && (
            <p className="text-sm text-gray-500">Arrival: {formatDateTime(bill.arrival_datetime)}</p>
          )}
          {bill.departure_datetime && (
            <p className="text-sm text-gray-500">Departure: {formatDateTime(bill.departure_datetime)}</p>
          )}
        </div>
      </div>

      {/* GST Info - Subtle line (only on GST/tax invoices) */}
      {bill.is_gst_bill && settings.gst_number && (
        <div className="text-xs text-gray-500 mb-6 pb-6 border-b border-gray-200">
          GSTIN: {settings.gst_number}
          {settings.state_name && settings.state_code && (
            <span className="ml-4">State: {settings.state_name} ({settings.state_code})</span>
          )}
        </div>
      )}

      {/* Bill To Section */}
      <div className="mb-8">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Bill To</p>
        <h3 className="text-lg font-semibold text-gray-900">{customer?.full_name || 'Guest'}</h3>
        {customer?.phone && (
          <p className="text-sm text-gray-600">{customer.phone}</p>
        )}
        {customer?.address && (
          <p className="text-sm text-gray-600">{customer.address}</p>
        )}
        {customer?.id_proof_type && customer?.id_proof_number && (
          <p className="text-xs text-gray-400 mt-1">{customer.id_proof_type}: {customer.id_proof_number}</p>
        )}
      </div>

      {/* Items Table - Clean Design */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
              <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.line_items && bill.line_items.length > 0 ? (
              bill.line_items.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-4 text-sm text-gray-400">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="py-4 text-sm text-gray-900 font-medium">{item.description}</td>
                  <td className="py-4 text-sm text-gray-900 text-right font-medium">
                    {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-b border-gray-100">
                <td className="py-4 text-sm text-gray-400">01</td>
                <td className="py-4 text-sm text-gray-900 font-medium">Room Charges</td>
                <td className="py-4 text-sm text-gray-900 text-right font-medium">
                  {bill.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Amount Summary - Right Aligned */}
      <div className="flex justify-end mb-8">
        <div className="w-72">
          <div className="flex justify-between py-2 text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="text-gray-900">{bill.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          {bill.tax_amount > 0 && (
            <>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">CGST ({formatRate(cgstRate)}%)</span>
                <span className="text-gray-900">{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">SGST ({formatRate(sgstRate)}%)</span>
                <span className="text-gray-900">{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </>
          )}
          {bill.discount_amount > 0 && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-500">Discount</span>
              <span className="text-green-600">-{bill.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between py-3 mt-2 border-t-2 border-gray-900">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-gray-900">
              ₹{bill.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="bg-gray-50 rounded-lg px-4 py-3 mb-12">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount in Words</p>
        <p className="text-sm font-medium text-gray-900">{totalInWords}</p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end mt-auto pt-8 border-t border-gray-200">
        <div className="text-xs text-gray-400">
          <p>Thank you for your business</p>
          <p className="mt-1">E. & O.E.</p>
        </div>
        <div className="text-right">
          <div className="w-48 pt-12 border-t border-gray-300">
            <p className="text-xs text-gray-500">Authorized Signature</p>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          .bill-print-container {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 0;
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
})

BillPrint.displayName = 'BillPrint'

export default BillPrint
