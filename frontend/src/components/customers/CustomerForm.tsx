import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import type { Customer } from '../../types'

interface CustomerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  customer?: Customer
}

export default function CustomerForm({ open, onOpenChange, onSubmit, customer }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    full_name: customer?.full_name || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    id_proof_type: customer?.id_proof_type || 'Aadhar',
    id_proof_number: customer?.id_proof_number || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      onOpenChange(false)
      // Reset form
      setFormData({
        full_name: '',
        phone: '',
        address: '',
        id_proof_type: 'Aadhar',
        id_proof_number: '',
      })
    } catch (err) {
      setError('Failed to save customer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-3 mb-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="123 Main St, City - 400001"
              />
            </div>

            <div>
              <Label htmlFor="id_proof_type">ID Proof Type *</Label>
              <Select
                id="id_proof_type"
                value={formData.id_proof_type}
                onChange={(e) => setFormData({ ...formData, id_proof_type: e.target.value })}
                required
              >
                <option value="Aadhar">Aadhar Card</option>
                <option value="Passport">Passport</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
                <option value="PAN Card">PAN Card</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="id_proof_number">ID Proof Number *</Label>
              <Input
                id="id_proof_number"
                value={formData.id_proof_number}
                onChange={(e) => setFormData({ ...formData, id_proof_number: e.target.value })}
                required
                placeholder="1234-5678-9012"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
