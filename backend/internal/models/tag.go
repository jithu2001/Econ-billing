package models

type Tag struct {
	ID         int64  `json:"id"`
	PropertyID int64  `json:"property_id"`
	Name       string `json:"name"`
}
