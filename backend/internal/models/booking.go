package models

type Booking struct {
	ID            int64  `json:"id"`
	ReservationID int64  `json:"reservation_id"`
	RoomID        int64  `json:"room_id"`
	Status        string `json:"status"`
	CreatedAt     string `json:"created_at"`
}
