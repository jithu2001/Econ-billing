package models

type BillItem struct {
	ID          int64   `json:"id"`
	BillID      int64   `json:"bill_id"`
	Description string  `json:"description"`
	Qty         float64 `json:"qty"`
	UnitPrice   float64 `json:"unit_price"`
	Amount      float64 `json:"amount"`
}
