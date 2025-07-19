package models

import "time"

type Customer struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Address     string    `json:"address"`
	Phone       string    `json:"phone"`
	IDCardPhoto string    `json:"id_card_photo"`
	CreatedAt   time.Time `json:"created_at"`
}