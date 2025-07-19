package models

import "time"

type BusinessSettings struct {
	ID               int       `json:"id"`
	PropertyName     string    `json:"property_name"`
	PropertyAddress  string    `json:"property_address"`
	GSTNumber        string    `json:"gst_number"`
	GSTPercentage    float64   `json:"gst_percentage"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}