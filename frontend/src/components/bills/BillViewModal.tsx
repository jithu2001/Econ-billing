import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog'
import { Card, CardContent } from '../ui/card'
import type { Bill } from '../../types'

interface BillViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: Bill | null
}

export default function BillViewModal({ open, onOpenChange, bill }: BillViewModalProps) {
  if (!bill) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Bill Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bill Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Bill ID</div>
                  <div className="font-medium">{bill.id}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Bill Date</div>
                  <div className="font-medium">{new Date(bill.bill_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Bill Type</div>
                  <div className="font-medium">{bill.bill_type}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      bill.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      bill.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                      bill.status === 'FINALIZED' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Breakdown */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">₹{bill.subtotal.toFixed(2)}</span>
                </div>

                {bill.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (GST)</span>
                    <span className="font-medium">₹{bill.tax_amount.toFixed(2)}</span>
                  </div>
                )}

                {bill.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-medium text-red-600">-₹{bill.discount_amount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>₹{bill.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {bill.reservation_id && (
            <div className="text-sm text-muted-foreground">
              Linked to Reservation ID: {bill.reservation_id}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
