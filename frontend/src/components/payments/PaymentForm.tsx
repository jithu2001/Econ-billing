import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import type { Payment } from '../../types'

interface PaymentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payment: Omit<Payment, 'id'>) => void
  billId: string
  billAmount: number
}

export default function PaymentForm({ open, onOpenChange, onSubmit, billId, billAmount }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    amount: billAmount,
    payment_method: 'Cash' as Payment['payment_method'],
    payment_date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      bill_id: billId,
      ...formData,
    })
    onOpenChange(false)
    setFormData({
      amount: billAmount,
      payment_method: 'Cash',
      payment_date: new Date().toISOString().split('T')[0],
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
                step="0.01"
                placeholder="0.00"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Bill Total: ₹{billAmount.toFixed(2)}
              </p>
            </div>

            <div>
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                id="payment_method"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as Payment['payment_method'] })}
                required
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
