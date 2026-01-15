import { forwardRef } from 'react'
import type { Bill, Customer, Settings } from '@/types'

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
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const totalInWords = `INR ${numberToWords(Math.floor(bill.total_amount))} Only`

  return (
    <div ref={ref} className="bill-print-container bg-white text-black p-8 w-[210mm] min-h-[297mm] font-sans text-sm">
      {/* Header */}
      <div className="border-2 border-black">
        {/* Lodge Info Header */}
        <div className="text-center py-4 border-b-2 border-black">
          <h1 className="text-xl font-bold uppercase tracking-wide">{settings.lodge_name || 'Lodge Name'}</h1>
          {settings.address && (
            <p className="text-xs mt-1">{settings.address}</p>
          )}
          {settings.gst_number && (
            <p className="text-xs mt-1">GSTIN/UIN: {settings.gst_number}</p>
          )}
          {settings.state_name && settings.state_code && (
            <p className="text-xs">State Name: {settings.state_name}, Code: {settings.state_code}</p>
          )}
          {settings.phone && (
            <p className="text-xs">Phone: {settings.phone}</p>
          )}
        </div>

        {/* Bill Title */}
        <div className="text-center py-2 border-b border-black bg-gray-100">
          <h2 className="text-base font-bold">BILL / INVOICE</h2>
        </div>

        {/* Bill Details Row */}
        <div className="grid grid-cols-2 border-b border-black">
          <div className="p-3 border-r border-black">
            <div className="grid grid-cols-2 gap-y-1">
              <span className="font-semibold">Bill No.</span>
              <span>: {billNumber}</span>
              <span className="font-semibold">Name</span>
              <span>: {customer?.full_name || 'Guest'}</span>
              <span className="font-semibold">Phone</span>
              <span>: {customer?.phone || '-'}</span>
              <span className="font-semibold">Address</span>
              <span>: {customer?.address || '-'}</span>
            </div>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-2 gap-y-1">
              <span className="font-semibold">Bill Date</span>
              <span>: {formatDate(bill.bill_date)}</span>
              <span className="font-semibold">Bill Type</span>
              <span>: {bill.bill_type}</span>
              <span className="font-semibold">Status</span>
              <span>: {bill.status}</span>
              {customer?.id_proof_type && (
                <>
                  <span className="font-semibold">ID Type</span>
                  <span>: {customer.id_proof_type}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-b border-r border-black p-2 text-left w-16">SR.NO.</th>
              <th className="border-b border-r border-black p-2 text-left">PARTICULARS</th>
              <th className="border-b border-black p-2 text-right w-32">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {bill.line_items && bill.line_items.length > 0 ? (
              bill.line_items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="border-b border-r border-black p-2">{idx + 1}</td>
                  <td className="border-b border-r border-black p-2 font-medium">{item.description}</td>
                  <td className="border-b border-black p-2 text-right">{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))
            ) : (
              <>
                <tr>
                  <td className="border-b border-r border-black p-2">1</td>
                  <td className="border-b border-r border-black p-2 font-medium">Room Charges</td>
                  <td className="border-b border-black p-2 text-right">{bill.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </>
            )}
            {/* Empty rows for spacing */}
            {Array.from({ length: Math.max(0, 8 - (bill.line_items?.length || 1)) }).map((_, idx) => (
              <tr key={`empty-${idx}`}>
                <td className="border-b border-r border-black p-2">&nbsp;</td>
                <td className="border-b border-r border-black p-2">&nbsp;</td>
                <td className="border-b border-black p-2">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Amount Summary */}
        <div className="grid grid-cols-2 border-t-2 border-black">
          <div className="p-3 border-r border-black">
            <p className="text-xs font-semibold">Amount in words:</p>
            <p className="font-bold mt-1">{totalInWords}</p>
          </div>
          <div>
            <div className="flex justify-between p-2 border-b border-black">
              <span>Subtotal</span>
              <span>{bill.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {bill.tax_amount > 0 && (
              <div className="flex justify-between p-2 border-b border-black">
                <span>Tax (GST)</span>
                <span>{bill.tax_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {bill.discount_amount > 0 && (
              <div className="flex justify-between p-2 border-b border-black">
                <span>Discount</span>
                <span>-{bill.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between p-2 font-bold bg-gray-100">
              <span>Grand Total</span>
              <span>₹{bill.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black p-4">
          <div className="flex justify-between items-end">
            <div className="text-xs text-gray-600">
              <p>E. & O. E.</p>
            </div>
            <div className="text-right">
              <p className="text-xs mb-8">For {settings.lodge_name || 'Lodge'}</p>
              <p className="text-xs border-t border-black pt-1">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          .bill-print-container {
            width: 210mm;
            min-height: 297mm;
            padding: 10mm;
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
