package models

import "time"

type Bill struct {
	ID          int       `json:"id"`
	BookingID   int       `json:"booking_id"`
	BillNumber  string    `json:"bill_number"`
	Subtotal    float64   `json:"subtotal"`
	GSTIncluded bool      `json:"gst_included"`
	GSTPercent  float64   `json:"gst_percent"`
	GSTAmount   float64   `json:"gst_amount"`
	TotalAmount float64   `json:"total_amount"`
	CreatedAt   time.Time `json:"created_at"`
	
	// Related data for bill display
	BusinessName    string `json:"business_name,omitempty"`
	BusinessAddress string `json:"business_address,omitempty"`
	BusinessGST     string `json:"business_gst,omitempty"`
	CustomerName    string `json:"customer_name,omitempty"`
	CustomerPhone   string `json:"customer_phone,omitempty"`
	CustomerAddress string `json:"customer_address,omitempty"`
	RoomNumber      string `json:"room_number,omitempty"`
	RoomTypeName    string `json:"room_type_name,omitempty"`
	CheckIn         time.Time `json:"check_in,omitempty"`
	CheckOut        time.Time `json:"check_out,omitempty"`
	Nights          int    `json:"nights,omitempty"`
	PricePerNight   float64 `json:"price_per_night,omitempty"`
}

type InvoiceCounter struct {
	ID            int       `json:"id"`
	CounterType   string    `json:"counter_type"`
	CurrentNumber int       `json:"current_number"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}