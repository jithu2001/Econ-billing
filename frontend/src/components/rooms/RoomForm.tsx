import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import type { Room, RoomType } from '../../types'

interface RoomFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (room: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'type'>) => void
  roomTypes: RoomType[]
  room?: Room
}

export default function RoomForm({ open, onOpenChange, onSubmit, roomTypes, room }: RoomFormProps) {
  const [formData, setFormData] = useState({
    room_number: room?.room_number || '',
    type_id: room?.type_id || (roomTypes[0]?.id || ''),
    status: room?.status || 'AVAILABLE' as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
    setFormData({
      room_number: '',
      type_id: roomTypes[0]?.id || '',
      status: 'AVAILABLE',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{room ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
            <Button type="submit">
              {room ? 'Update' : 'Create'} Room
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
