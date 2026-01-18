// User types
export interface User {
  id: string
  username: string
  role: 'ADMIN' | 'STAFF'
  created_at: string
  updated_at: string
}

// Customer types
export interface Customer {
  id: string
  full_name: string
  phone: string
  address: string
  id_proof_type: string
  id_proof_number: string
  created_at: string
  updated_at: string
}

// Room types
export interface RoomType {
  id: string
  name: string
  default_rate: number
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  room_number: string
  type_id: string
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
  created_at: string
  updated_at: string
  type?: RoomType
}

// Reservation types
export interface Reservation {
  id: string
  customer_id: string
  room_id: string
  check_in_date: string
  actual_check_in_date?: string
  expected_check_out_date: string
  actual_check_out_date?: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  created_at: string
  updated_at: string
  customer?: Customer
  room?: Room
}

// Bill types
export interface BillLineItem {
  id: string
  bill_id: string
  description: string
  amount: number
  created_at: string
}

export interface Bill {
  id: string
  customer_id: string
  reservation_id?: string
  bill_type: 'ROOM' | 'WALK_IN' | 'FOOD' | 'MANUAL'
  bill_date: string
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  status: 'DRAFT' | 'FINALIZED' | 'PAID' | 'UNPAID'
  generated_by: string
  created_at: string
  updated_at: string
  customer?: Customer
  reservation?: Reservation
  line_items?: BillLineItem[]
}

// Payment types
export interface Payment {
  id: string
  bill_id: string
  amount: number
  payment_method: 'Cash' | 'Card' | 'UPI'
  payment_date: string
}

// Settings types
export interface Settings {
  id?: string
  lodge_name: string
  address: string
  phone: string
  gst_number: string
  state_name: string
  state_code: string
  created_at?: string
  updated_at?: string
}
