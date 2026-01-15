import { Dialog, DialogContent, DialogClose } from '../ui/dialog'
import BillEditor, { type BillData } from './BillEditor'
import type { Bill, Reservation } from '../../types'

interface BillModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (billData: BillData) => void
  reservationId?: string
  reservation?: Reservation
  billType?: Bill['bill_type']
}

export default function BillModal({
  open,
  onOpenChange,
  onSubmit,
  reservationId,
  reservation,
  billType = 'MANUAL'
}: BillModalProps) {
  const handleSave = (billData: BillData) => {
    onSubmit(billData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogClose onClose={() => onOpenChange(false)} />
        <BillEditor
          billType={billType}
          reservationId={reservationId}
          reservation={reservation}
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
