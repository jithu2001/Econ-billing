// frontend/src/services/reservation.service.ts
import { ReservationAPI } from '@/lib/bindings'
import type { Reservation } from '@/types'

export interface CreateReservationRequest {
  customer_id: string; room_id: string;
  check_in_date: string; expected_check_out_date?: string;
}
export interface CheckoutRequest { checkout_date: string }

export const reservationService = {
  getAll: () => ReservationAPI.GetAll() as unknown as Promise<Reservation[]>,
  getById: (id: string) => ReservationAPI.GetByID(id) as unknown as Promise<Reservation>,
  create: (d: CreateReservationRequest) =>
    ReservationAPI.Create({
      customer_id: d.customer_id, room_id: d.room_id,
      check_in_date: d.check_in_date,
      expected_check_out_date: d.expected_check_out_date ?? '',
    }) as unknown as Promise<Reservation>,
  checkin: (id: string) => ReservationAPI.CheckIn(id) as unknown as Promise<void>,
  cancel: (id: string) => ReservationAPI.Cancel(id) as unknown as Promise<void>,
  checkout: (id: string, d: CheckoutRequest) =>
    ReservationAPI.Checkout(id, d.checkout_date) as unknown as Promise<void>,
}
