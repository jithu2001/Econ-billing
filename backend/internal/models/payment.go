package models

type Payment struct {
	ID        int64   `json:"id"`
	BillID    int64   `json:"bill_id"`
	PaidAmount float64 `json:"paid_amount"`
	PaidAt    string  `json:"paid_at"`
	Method    string  `json:"method"`
	Notes     string  `json:"notes"`
}
