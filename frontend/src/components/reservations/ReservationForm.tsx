import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import type { Reservation, Customer, Room } from '../../types'

interface ReservationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'customer' | 'room'>) => Promise<void>
  customers: Customer[]
  rooms: Room[]
  reservation?: Reservation
  preselectedCustomerId?: string
  preselectedRoomId?: string
}

export default function ReservationForm({
  open,
  onOpenChange,
  onSubmit,
  customers,
  rooms,
  reservation,
  preselectedCustomerId,
  preselectedRoomId
}: ReservationFormProps) {
  const availableRooms = rooms.filter(r => r.status === 'AVAILABLE')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    customer_id: reservation?.customer_id || preselectedCustomerId || (customers[0]?.id || ''),
    room_id: reservation?.room_id || preselectedRoomId || (availableRooms[0]?.id || ''),
    check_in_date: reservation?.check_in_date || new Date().toISOString().split('T')[0],
    expected_check_out_date: reservation?.expected_check_out_date || '',
    status: reservation?.status || 'ACTIVE' as const,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      onOpenChange(false)
      setFormData({
        customer_id: customers[0]?.id || '',
        room_id: availableRooms[0]?.id || '',
        check_in_date: new Date().toISOString().split('T')[0],
        expected_check_out_date: '',
        status: 'ACTIVE',
      })
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Failed to create reservation'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{reservation ? 'Edit Reservation' : 'New Reservation'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="customer_id">Customer *</Label>
              <Select
                id="customer_id"
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                required
              >
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name} - {customer.phone}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="room_id">Room *</Label>
              <Select
                id="room_id"
                value={formData.room_id}
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                required
              >
                {availableRooms.length === 0 ? (
                  <option value="">No available rooms</option>
                ) : (
                  availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number} - {room.type?.name} (₹{room.type?.default_rate}/night)
                    </option>
                  ))
                )}
              </Select>
              {availableRooms.length === 0 && (
                <p className="text-sm text-destructive mt-1">No rooms available for reservation</p>
              )}
            </div>

            <div>
              <Label htmlFor="check_in_date">Check-in Date *</Label>
              <Input
                id="check_in_date"
                type="date"
                value={formData.check_in_date}
                onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="expected_check_out_date">Expected Check-out Date *</Label>
              <Input
                id="expected_check_out_date"
                type="date"
                value={formData.expected_check_out_date}
                onChange={(e) => setFormData({ ...formData, expected_check_out_date: e.target.value })}
                required
                min={formData.check_in_date}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={availableRooms.length === 0 || isSubmitting}>
              {isSubmitting ? 'Creating...' : (reservation ? 'Update' : 'Create')} Reservation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
