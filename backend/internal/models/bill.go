package models

type Bill struct {
	ID            int64       `json:"id"`
	ReservationID int64       `json:"reservation_id"`
	BaseAmount    float64     `json:"base_amount"`
	GSTPercentage float64     `json:"gst_percentage"`
	GSTAmount     float64     `json:"gst_amount"`
	TotalAmount   float64     `json:"total_amount"`
	InvoicePath   string      `json:"invoice_path"`
	GeneratedAt   string      `json:"generated_at"`
	Items         []BillItem  `json:"items,omitempty"`
	Payments      []Payment   `json:"payments,omitempty"`
}
