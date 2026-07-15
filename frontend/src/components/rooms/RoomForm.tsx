import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import type { Room, RoomType } from '../../types'

interface RoomFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (room: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'type'>) => void | Promise<void>
  roomTypes: RoomType[]
  room?: Room
}

export default function RoomForm({ open, onOpenChange, onSubmit, roomTypes, room }: RoomFormProps) {
  const [formData, setFormData] = useState({
    room_number: '',
    type_id: '',
    status: 'AVAILABLE' as Room['status'],
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Seed the form each time it opens, once roomTypes are available, so
  // type_id always holds a real value (not an empty string from first mount).
  useEffect(() => {
    if (!open) return
    setFormData({
      room_number: room?.room_number || '',
      type_id: room?.type_id || roomTypes[0]?.id || '',
      status: room?.status || 'AVAILABLE',
    })
    setError('')
  }, [open, room, roomTypes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.type_id) {
      setError('Please select a room type first.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch {
      setError('Failed to save room. A room with this number may already exist.')
    } finally {
      setSubmitting(false)
    }
  }

  const noRoomTypes = roomTypes.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{room ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {noRoomTypes && (
              <div
                className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                style={{ background: 'hsl(var(--status-amber)/0.10)', borderColor: 'hsl(var(--status-amber)/0.3)', color: 'hsl(38 92% 32%)' }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                Add a room type first before creating a room.
              </div>
            )}

            {error && (
              <div
                className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                style={{ background: 'hsl(var(--status-red)/0.08)', borderColor: 'hsl(var(--status-red)/0.3)', color: 'hsl(5 72% 38%)' }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="room_number">Room Number *</Label>
              <Input
                id="room_number"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                required
                placeholder="101"
              />
            </div>

            <div>
              <Label htmlFor="type_id">Room Type *</Label>
              <Select
                id="type_id"
                value={formData.type_id}
                onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                required
              >
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - ₹{type.default_rate}/night
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Room['status'] })}
                required
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || noRoomTypes}>
              {submitting ? 'Saving...' : `${room ? 'Update' : 'Create'} Room`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
