package models

type Customer struct {
	ID           int64  `json:"id"`
	PropertyID   int64  `json:"property_id"`
	Name         string `json:"name"`
	Phone        string `json:"phone"`
	Email        string `json:"email"`
	AddressLine1 string `json:"address_line1"`
	AddressLine2 string `json:"address_line2"`
	City         string `json:"city"`
	State        string `json:"state"`
	Country      string `json:"country"`
	PostalCode   string `json:"postal_code"`
	IDType       string `json:"id_type"`
	IDNumber     string `json:"id_number"`
	IDFrontPath  string `json:"id_front_path"`
	IDBackPath   string `json:"id_back_path"`
	CreatedAt    string `json:"created_at"`
}
