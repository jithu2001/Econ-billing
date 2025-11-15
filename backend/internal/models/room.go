package models

type Room struct {
	ID          int64   `json:"id"`
	PropertyID  int64   `json:"property_id"`
	RoomNumber  string  `json:"room_number"`
	TagID       *int64  `json:"tag_id"`
	Price       float64 `json:"price"`
	Status      string  `json:"status"`
	Description string  `json:"description"`
	CreatedAt   string  `json:"created_at"`
}
