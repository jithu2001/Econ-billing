// frontend/src/services/bill.service.ts
import { BillAPI, PaymentAPI } from '@/lib/bindings'
import type { Bill, Payment } from '@/types'

export interface CreateBillRequest {
  customer_id: string; reservation_id?: string;
  bill_type: 'ROOM' | 'WALK_IN' | 'FOOD' | 'MANUAL';
  bill_date: string;
  is_gst_bill?: boolean;
  subtotal: number; tax_amount: number; discount_amount: number; total_amount: number;
  status?: 'DRAFT' | 'FINALIZED' | 'PAID' | 'UNPAID';
  line_items: { description: string; amount: number }[];
}

export interface CreatePaymentRequest {
  amount: number; payment_method: 'Cash' | 'Card' | 'UPI'; payment_date: string;
}

export const billService = {
  create: (d: CreateBillRequest) =>
    BillAPI.Create({
      customer_id: d.customer_id,
      reservation_id: d.reservation_id ?? undefined,
      bill_type: d.bill_type, bill_date: d.bill_date,
      is_gst_bill: d.is_gst_bill ?? false,
      subtotal: d.subtotal, tax_amount: d.tax_amount,
      discount_amount: d.discount_amount, total_amount: d.total_amount,
      status: d.status ?? 'DRAFT',
      line_items: d.line_items,
    } as any) as unknown as Promise<Bill>,
  getById: (id: string) => BillAPI.GetByID(id) as unknown as Promise<Bill>,
  getByCustomerId: (customerId: string) => BillAPI.GetByCustomerID(customerId) as unknown as Promise<Bill[]>,
  finalize: (id: string) => BillAPI.Finalize(id) as unknown as Promise<void>,
  createPayment: (billId: string, d: CreatePaymentRequest) =>
    PaymentAPI.Create(billId, {
      amount: d.amount, payment_method: d.payment_method, payment_date: d.payment_date,
    }) as unknown as Promise<Payment>,
  getPaymentsByBillId: (billId: string) => PaymentAPI.GetByBillID(billId) as unknown as Promise<Payment[]>,
}
