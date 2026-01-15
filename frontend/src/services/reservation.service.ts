import { apiClient } from '@/lib/api';
import type { Reservation } from '@/types';

export interface CreateReservationRequest {
  customer_id: string;
  room_id: string;
  check_in_date: string;
  expected_check_out_date?: string;
}

export interface CheckoutRequest {
  checkout_date: string;
}

export const reservationService = {
  async getAll(): Promise<Reservation[]> {
    const response = await apiClient.get<Reservation[]>('/api/reservations');
    return response.data;
  },

  async getById(id: string): Promise<Reservation> {
    const response = await apiClient.get<Reservation>(`/api/reservations/${id}`);
    return response.data;
  },

  async create(data: CreateReservationRequest): Promise<Reservation> {
    const response = await apiClient.post<Reservation>('/api/reservations', data);
    return response.data;
  },

  async checkin(id: string): Promise<void> {
    await apiClient.put(`/api/reservations/${id}/checkin`);
  },

  async cancel(id: string): Promise<void> {
    await apiClient.put(`/api/reservations/${id}/cancel`);
  },

  async checkout(id: string, data: CheckoutRequest): Promise<Reservation> {
    const response = await apiClient.put<Reservation>(`/api/reservations/${id}/checkout`, data);
    return response.data;
  },
};
