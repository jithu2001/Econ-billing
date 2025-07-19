package models

import "time"

type RoomType struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type Room struct {
	ID        int       `json:"id"`
	Number    string    `json:"number"`
	TypeID    int       `json:"type_id"`
	TypeName  string    `json:"type_name,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}