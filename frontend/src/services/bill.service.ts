import { apiClient } from '@/lib/api';
import type { Bill, BillLineItem, Payment } from '@/types';

export interface CreateBillRequest {
  customer_id: string;
  reservation_id?: string;
  bill_type: 'ROOM' | 'WALK_IN' | 'FOOD' | 'MANUAL';
  bill_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status?: 'DRAFT' | 'FINALIZED' | 'PAID' | 'UNPAID';
  line_items: {
    description: string;
    amount: number;
  }[];
}

export interface CreatePaymentRequest {
  amount: number;
  payment_method: 'CASH' | 'CARD' | 'UPI';
  payment_date: string;
}

export const billService = {
  async create(data: CreateBillRequest): Promise<Bill> {
    const response = await apiClient.post<Bill>('/api/bills', data);
    return response.data;
  },

  async getById(id: string): Promise<Bill> {
    const response = await apiClient.get<Bill>(`/api/bills/${id}`);
    return response.data;
  },

  async getByCustomerId(customerId: string): Promise<Bill[]> {
    const response = await apiClient.get<Bill[]>(`/api/customers/${customerId}/bills`);
    return response.data;
  },

  async finalize(id: string): Promise<Bill> {
    const response = await apiClient.post<Bill>(`/api/bills/${id}/finalize`);
    return response.data;
  },

  // Payments
  async createPayment(billId: string, data: CreatePaymentRequest): Promise<Payment> {
    const response = await apiClient.post<Payment>(`/api/bills/${billId}/payments`, data);
    return response.data;
  },

  async getPaymentsByBillId(billId: string): Promise<Payment[]> {
    const response = await apiClient.get<Payment[]>(`/api/bills/${billId}/payments`);
    return response.data;
  },
};
