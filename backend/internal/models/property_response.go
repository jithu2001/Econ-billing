package models

type PropertyResponse struct {
	ID         int64   `json:"id"`
	Name       string  `json:"name"`
	Address    string  `json:"address"`
	Phone      string  `json:"phone"`
	GSTNumber  string  `json:"gst_number"`
	DefaultGST float64 `json:"default_gst"`
	CreatedAt  string  `json:"created_at"`
}

