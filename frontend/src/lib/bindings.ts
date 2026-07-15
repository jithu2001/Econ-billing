// frontend/src/lib/bindings.ts
export * as AuthAPI from '../../wailsjs/go/bindings/AuthBinding'
export * as CustomerAPI from '../../wailsjs/go/bindings/CustomerBinding'
export * as RoomAPI from '../../wailsjs/go/bindings/RoomBinding'
export * as ReservationAPI from '../../wailsjs/go/bindings/ReservationBinding'
export * as BillAPI from '../../wailsjs/go/bindings/BillBinding'
export * as PaymentAPI from '../../wailsjs/go/bindings/PaymentBinding'
export * as SettingsAPI from '../../wailsjs/go/bindings/SettingsBinding'
export * as AppAPI from '../../wailsjs/go/main/App'

export const handleApiError = (err: unknown): string => {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'An unexpected error occurred'
}
