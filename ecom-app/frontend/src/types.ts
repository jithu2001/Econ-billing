export interface BusinessSettings {
  id?: number;
  property_name: string;
  property_address: string;
  gst_number: string;
  gst_percentage: number;
  created_at?: string;
  updated_at?: string;
}

export interface RoomType {
  id?: number;
  name: string;
  created_at?: string;
}

export interface Room {
  id?: number;
  number: string;
  type_id: number;
  type_name?: string;
  created_at?: string;
}

export interface Customer {
  id?: number;
  name: string;
  address: string;
  phone: string;
  id_card_photo?: string;
  created_at?: string;
}

export interface Booking {
  id?: number;
  customer_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  price_per_night: number;
  total_amount?: number;
  nights?: number;
  status?: string;
  created_at?: string;
  
  // Related data for display
  customer_name?: string;
  customer_phone?: string;
  room_number?: string;
  room_type_name?: string;
}

export interface Bill {
  id?: number;
  booking_id: number;
  bill_number: string;
  subtotal: number;
  gst_included?: boolean;
  gst_percent: number;
  gst_amount: number;
  total_amount: number;
  created_at?: string;
  
  // Related data for bill display
  business_name?: string;
  business_address?: string;
  business_gst?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  room_number?: string;
  room_type_name?: string;
  check_in?: string;
  check_out?: string;
  nights?: number;
  price_per_night?: number;
}