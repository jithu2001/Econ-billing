import { useState } from 'react'
import { Plus, Trash2, Receipt, Calendar } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import type { BillLineItem, Reservation } from '../../types'
import { gstSplit, formatRate } from '@/lib/gst'

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
  arrivalDateTime?: string
  departureDateTime?: string
}

type EditableItem = Omit<BillLineItem, 'id' | 'bill_id' | 'created_at'>

export default function BillEditor({ billType, reservationId, reservation, onSave, onCancel }: BillEditorProps) {
  const isStayBill = billType === 'ROOM' || billType === 'MANUAL'

  // Stay: arrival/departure date+time drive both the bill display and the nights calc.
  const [arrivalDate, setArrivalDate] = useState(
    reservation ? reservation.actual_check_in_date || reservation.check_in_date : ''
  )
  const [arrivalTime, setArrivalTime] = useState(reservation ? '12:00' : '')
  const [departureDate, setDepartureDate] = useState(
    reservation ? reservation.actual_check_out_date || reservation.expected_check_out_date : ''
  )
  const [departureTime, setDepartureTime] = useState(reservation ? '11:00' : '')
  const [ratePerNight, setRatePerNight] = useState(reservation?.room?.type?.default_rate || 1000)

  // User-entered extras (the room charge is computed automatically, not stored here).
  const [extraItems, setExtraItems] = useState<EditableItem[]>([{ description: '', amount: 0 }])

  const [enableGST, setEnableGST] = useState(true)
  const [gstPercentage, setGstPercentage] = useState(18)
  const [gstInclusive, setGstInclusive] = useState(false)
  const [discountAmount, setDiscountAmount] = useState(0)

  // Combine date + time into the ISO value persisted on the bill (empty if no date set).
  const arrivalDateTime = arrivalDate ? `${arrivalDate}T${arrivalTime || '00:00'}` : ''
  const departureDateTime = departureDate ? `${departureDate}T${departureTime || '00:00'}` : ''

  // Nights between arrival and departure dates; same-day counts as 1 night.
  const numberOfNights = (() => {
    if (!arrivalDate || !departureDate) return 0
    const a = new Date(arrivalDate)
    const d = new Date(departureDate)
    const diff = Math.ceil((d.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
    return diff >= 1 ? diff : 1
  })()

  // Auto room charge for stay bills — recomputes live from rate × nights.
  const roomNumber = reservation?.room?.room_number || ''
  const roomChargeAmount = isStayBill && ratePerNight > 0 && numberOfNights > 0 ? ratePerNight * numberOfNights : 0
  const roomChargeDescription =
    `Room Charge${roomNumber ? ` - ${roomNumber}` : ''} (${numberOfNights} ${numberOfNights === 1 ? 'night' : 'nights'} × ₹${ratePerNight}/night)`

  const roomChargeItem: EditableItem[] = roomChargeAmount > 0
    ? [{ description: roomChargeDescription, amount: roomChargeAmount }]
    : []

  // What actually gets billed: the auto room charge plus any non-empty extras.
  const effectiveLineItems: EditableItem[] = [
    ...roomChargeItem,
    ...extraItems.filter((it) => it.amount > 0 || it.description.trim() !== ''),
  ]

  const lineTotal = effectiveLineItems.reduce((sum, it) => sum + (it.amount || 0), 0)

  let subtotal: number
  let taxAmount: number
  let totalAmount: number

  if (enableGST && gstInclusive && gstPercentage > 0) {
    // Entered amounts already include GST — extract the tax out of the total.
    subtotal = lineTotal / (1 + gstPercentage / 100)
    taxAmount = lineTotal - subtotal
    totalAmount = lineTotal - discountAmount
  } else if (enableGST) {
    // GST added on top of the entered amounts.
    subtotal = lineTotal
    taxAmount = (lineTotal * gstPercentage) / 100
    totalAmount = lineTotal + taxAmount - discountAmount
  } else {
    subtotal = lineTotal
    taxAmount = 0
    totalAmount = lineTotal - discountAmount
  }

  const { cgstAmount, sgstAmount, cgstRate, sgstRate } = gstSplit(subtotal, taxAmount)

  const addLineItem = () => {
    setExtraItems([...extraItems, { description: '', amount: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (extraItems.length > 1) {
      setExtraItems(extraItems.filter((_, i) => i !== index))
    } else {
      setExtraItems([{ description: '', amount: 0 }])
    }
  }

  const updateLineItem = (index: number, field: 'description' | 'amount', value: string | number) => {
    const updated = [...extraItems]
    updated[index] = { ...updated[index], [field]: value }
    setExtraItems(updated)
  }

  const addCommonItem = (description: string, amount: number) => {
    setExtraItems([...extraItems, { description, amount }])
  }

  const handleSave = () => {
    const billData: BillData = {
      billType,
      reservationId,
      lineItems: effectiveLineItems,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
      enableGST,
      gstPercentage,
      checkInDate: arrivalDate,
      checkOutDate: departureDate,
      numberOfDays: numberOfNights,
      arrivalDateTime: arrivalDateTime || undefined,
      departureDateTime: departureDateTime || undefined,
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
          {/* Stay: arrival/departure + (for stay bills) rate & auto room charge */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Stay</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Arrival</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      aria-label="Arrival date"
                      value={arrivalDate}
                      onChange={(e) => setArrivalDate(e.target.value)}
                      className="h-9"
                    />
                    <Input
                      type="time"
                      aria-label="Arrival time"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Departure</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      aria-label="Departure date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="h-9"
                      min={arrivalDate || undefined}
                    />
                    <Input
                      type="time"
                      aria-label="Departure time"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                {isStayBill && (
                  <div className="grid grid-cols-2 gap-3 items-end">
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
                    <div className="text-xs text-muted-foreground pb-2">
                      {numberOfNights > 0
                        ? `${numberOfNights} ${numberOfNights === 1 ? 'night' : 'nights'} × ₹${ratePerNight} = ₹${roomChargeAmount.toFixed(2)}`
                        : 'Select arrival & departure dates'}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Add shortcuts */}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => addCommonItem('Food & Beverage', 0)}>
              + Food
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => addCommonItem('Cleaning Service', 200)}>
              + Cleaning
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => addCommonItem('Extra Bed', 300)}>
              + Extra Bed
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => addCommonItem('Laundry', 150)}>
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

            {/* Auto room charge (read-only — driven by the Stay section) */}
            {roomChargeAmount > 0 && (
              <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm">
                <span className="text-muted-foreground">{roomChargeDescription}</span>
                <span className="font-medium">₹{roomChargeAmount.toFixed(2)}</span>
              </div>
            )}

            {extraItems.map((item, index) => (
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

            {/* GST controls */}
            <div className="space-y-2">
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="gst-inclusive"
                    checked={gstInclusive}
                    onChange={(e) => setGstInclusive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="gst-inclusive" className="text-sm text-muted-foreground cursor-pointer">
                    Amounts already include GST
                  </label>
                </div>
              )}
            </div>

            {enableGST && taxAmount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CGST ({formatRate(cgstRate)}%)</span>
                  <span className="font-medium">₹{cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SGST ({formatRate(sgstRate)}%)</span>
                  <span className="font-medium">₹{sgstAmount.toFixed(2)}</span>
                </div>
              </>
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
            <Button variant="outline" className="flex-1" onClick={handleSave}>
              Save as Draft
            </Button>
            <Button className="flex-1" onClick={handleSave}>
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
            {effectiveLineItems.length > 0 ? (
              effectiveLineItems.map((item, index) => (
                <div key={index} className="flex justify-between pl-4">
                  <span className="text-muted-foreground">{item.description || '(No description)'}</span>
                  <span>₹{item.amount.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="pl-4 text-muted-foreground">No items yet</div>
            )}
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
