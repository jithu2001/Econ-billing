package models

type CreateRoomRequest struct {
	PropertyID  int64   `json:"property_id"`
	RoomNumber  string  `json:"room_number"`
	TagID       *int64  `json:"tag_id"`
	Price       float64 `json:"price"`
	Status      string  `json:"status"`
	Description string  `json:"description"`
}

type UpdateRoomRequest struct {
	RoomNumber  string  `json:"room_number"`
	TagID       *int64  `json:"tag_id"`
	Price       float64 `json:"price"`
	Status      string  `json:"status"`
	Description string  `json:"description"`
}

