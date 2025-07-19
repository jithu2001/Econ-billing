package models

import "time"

type Booking struct {
	ID            int       `json:"id"`
	CustomerID    int       `json:"customer_id"`
	RoomID        int       `json:"room_id"`
	CheckIn       time.Time `json:"check_in"`
	CheckOut      time.Time `json:"check_out"`
	PricePerNight float64   `json:"price_per_night"`
	TotalAmount   float64   `json:"total_amount"`
	Nights        int       `json:"nights"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	
	// Related data for display
	CustomerName    string `json:"customer_name,omitempty"`
	CustomerPhone   string `json:"customer_phone,omitempty"`
	CustomerAddress string `json:"customer_address,omitempty"`
	RoomNumber      string `json:"room_number,omitempty"`
	RoomTypeName    string `json:"room_type_name,omitempty"`
}

type BookingRequest struct {
	CustomerID    int     `json:"customer_id"`
	RoomID        int     `json:"room_id"`
	CheckIn       string  `json:"check_in"`   // Format: "2006-01-02"
	CheckOut      string  `json:"check_out"`  // Format: "2006-01-02"
	PricePerNight float64 `json:"price_per_night"`
}