package models

type Reservation struct {
	ID           int64  `json:"id"`
	PropertyID   int64  `json:"property_id"`
	CustomerID   int64  `json:"customer_id"`
	Platform     string `json:"platform"`
	CheckInDate  string `json:"checkin_date"`
	CheckOutDate string `json:"checkout_date"`
	Status       string `json:"status"`
	Notes        string `json:"notes"`
	CreatedAt    string `json:"created_at"`
}
