import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import type { RoomType } from '../../types'

interface RoomTypeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (roomType: Omit<RoomType, 'id' | 'created_at' | 'updated_at'>) => void
  roomType?: RoomType
}

export default function RoomTypeForm({ open, onOpenChange, onSubmit, roomType }: RoomTypeFormProps) {
  const [formData, setFormData] = useState({
    name: roomType?.name || '',
    default_rate: roomType?.default_rate || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
    setFormData({ name: '', default_rate: 0 })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{roomType ? 'Edit Room Type' : 'Add New Room Type'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Room Type Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Standard, Deluxe, Suite"
              />
            </div>

            <div>
              <Label htmlFor="default_rate">Default Rate (per night) *</Label>
              <Input
                id="default_rate"
                type="number"
                value={formData.default_rate || ''}
                onChange={(e) => setFormData({ ...formData, default_rate: parseFloat(e.target.value) || 0 })}
                required
                placeholder="1000"
                step="0.01"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {roomType ? 'Update' : 'Create'} Room Type
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
