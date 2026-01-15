import { useState, useEffect } from 'react'
import { Plus, Trash2, Receipt, Calendar } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import type { BillLineItem, Reservation } from '../../types'

interface BillEditorProps {
  billType: 'ROOM' | 'WALK_IN' | 'FOOD' | 'MANUAL'
  reservationId?: string
  reservation?: Reservation
  onSave?: (billData: BillData) => void
  onCancel?: () => void
}

export interface BillData {
  billType: string
  reservationId?: string
  lineItems: Omit<BillLineItem, 'id' | 'bill_id' | 'created_at'>[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  enableGST: boolean
  gstPercentage: number
  checkInDate?: string
  checkOutDate?: string
  numberOfDays?: number
}

export default function BillEditor({ billType, reservationId, reservation, onSave, onCancel }: BillEditorProps) {
  const [checkInDate, setCheckInDate] = useState(reservation?.check_in_date || '')
  const [checkOutDate, setCheckOutDate] = useState(reservation?.expected_check_out_date || '')
  const [ratePerNight, setRatePerNight] = useState(reservation?.room?.type?.default_rate || 1000)

  const [lineItems, setLineItems] = useState<Omit<BillLineItem, 'id' | 'bill_id' | 'created_at'>[]>([
    { description: '', amount: 0 },
  ])
  const [enableGST, setEnableGST] = useState(true)
  const [gstPercentage, setGstPercentage] = useState(18)
  const [discountAmount, setDiscountAmount] = useState(0)

  // Calculate number of days
  const calculateDays = () => {
    if (!checkInDate || !checkOutDate) return 0
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays || 1 // At least 1 day
  }

  const numberOfDays = calculateDays()

  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  const taxAmount = enableGST ? (subtotal * gstPercentage) / 100 : 0
  const totalAmount = subtotal + taxAmount - discountAmount

  useEffect(() => {
    // If this is a room bill with reservation, pre-populate with room charges
    if ((billType === 'ROOM' || billType === 'MANUAL') && reservation) {
      const days = calculateDays()
      const roomCharge = (reservation.room?.type?.default_rate || ratePerNight) * days
      setLineItems([
        {
          description: `Room Charge - ${reservation.room?.room_number || ''} (${days} ${days === 1 ? 'day' : 'days'} × ₹${reservation.room?.type?.default_rate || ratePerNight}/night)`,
          amount: roomCharge
        }
      ])
    }
  }, [billType, reservation, checkInDate, checkOutDate])

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', amount: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index: number, field: 'description' | 'amount', value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const addCommonItem = (description: string, amount: number) => {
    setLineItems([...lineItems, { description, amount }])
  }

  const calculateRoomCharge = () => {
    const days = calculateDays()
    const roomCharge = ratePerNight * days
    const roomNumber = reservation?.room?.room_number || ''
    const description = `Room Charge${roomNumber ? ` - ${roomNumber}` : ''} (${days} ${days === 1 ? 'day' : 'days'} × ₹${ratePerNight}/night)`

    // Replace first item or add if empty
    if (lineItems.length === 1 && lineItems[0].description === '' && lineItems[0].amount === 0) {
      setLineItems([{ description, amount: roomCharge }])
    } else {
      setLineItems([{ description, amount: roomCharge }, ...lineItems])
    }
  }

  const handleSave = () => {
    const billData: BillData = {
      billType,
      reservationId,
      lineItems,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      enableGST,
      gstPercentage,
      checkInDate,
      checkOutDate,
      numberOfDays,
    }

    onSave?.(billData)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bill Editor</CardTitle>
          <CardDescription>
            {billType === 'ROOM' ? 'Room stay charges' : `${billType} bill`}
            {reservationId && ' (linked to reservation)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stay Details Section */}
          {(billType === 'ROOM' || billType === 'MANUAL') && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Stay Details & Room Charges</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="check_in_date" className="text-xs">Check-in Date</Label>
                      <Input
                        id="check_in_date"
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="check_out_date" className="text-xs">Check-out Date</Label>
                      <Input
                        id="check_out_date"
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="h-9"
                        min={checkInDate}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="rate_per_night" className="text-xs">Rate per Night (₹)</Label>
                      <Input
                        id="rate_per_night"
                        type="number"
                        value={ratePerNight || ''}
                        onChange={(e) => setRatePerNight(parseFloat(e.target.value) || 0)}
                        className="h-9"
                        placeholder="1000"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="text-xs text-muted-foreground mb-1">
                        {numberOfDays > 0 ? `${numberOfDays} ${numberOfDays === 1 ? 'day' : 'days'} = ₹${(ratePerNight * numberOfDays).toFixed(2)}` : 'Select dates'}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={calculateRoomCharge}
                        disabled={!checkInDate || !checkOutDate || !ratePerNight}
                        className="h-9"
                      >
                        Calculate & Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Add Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addCommonItem('Food & Beverage', 0)}
            >
              + Food
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addCommonItem('Cleaning Service', 200)}
            >
              + Cleaning
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addCommonItem('Extra Bed', 300)}
            >
              + Extra Bed
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addCommonItem('Laundry', 150)}
            >
              + Laundry
            </Button>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Line Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            {lineItems.map((item, index) => (
              <div key={index} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  />
                </div>
                <div className="w-40">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={item.amount || ''}
                    onChange={(e) => updateLineItem(index, 'amount', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLineItem(index)}
                  disabled={lineItems.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>

            {/* GST Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="gst-toggle"
                  checked={enableGST}
                  onChange={(e) => setEnableGST(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="gst-toggle" className="text-sm text-muted-foreground cursor-pointer">
                  Enable GST
                </label>
              </div>
              {enableGST && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={gstPercentage}
                    onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              )}
            </div>

            {enableGST && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST ({gstPercentage}%)</span>
                <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Discount */}
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Discount</label>
              <div className="flex items-center gap-2">
                <span className="text-sm">₹</span>
                <Input
                  type="number"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  className="w-32 h-8 text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount Applied</span>
                <span className="font-medium text-red-600">-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total Amount</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSave}
            >
              Save as Draft
            </Button>
            <Button
              className="flex-1"
              onClick={handleSave}
            >
              <Receipt className="mr-2 h-4 w-4" />
              Finalize Bill
            </Button>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bill Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Bill Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="font-medium">Items:</div>
            {lineItems.map((item, index) => (
              <div key={index} className="flex justify-between pl-4">
                <span className="text-muted-foreground">{item.description || '(No description)'}</span>
                <span>₹{item.amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
