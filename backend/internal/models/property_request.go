package models

type CreatePropertyRequest struct {
	Name       string  `json:"name"`
	Address    string  `json:"address"`
	Phone      string  `json:"phone"`
	GSTNumber  string  `json:"gst_number"`
	DefaultGST float64 `json:"default_gst"`
	Password   string  `json:"password"`
}

