package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReservationStatus string

const (
	ReservationStatusActive    ReservationStatus = "ACTIVE"
	ReservationStatusCompleted ReservationStatus = "COMPLETED"
	ReservationStatusCancelled ReservationStatus = "CANCELLED"
)

type Reservation struct {
	ID                    uuid.UUID         `gorm:"type:uuid;primaryKey" json:"id"`
	CustomerID            uuid.UUID         `gorm:"type:uuid;not null" json:"customer_id"`
	Customer              *Customer         `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	RoomID                uuid.UUID         `gorm:"type:uuid;not null" json:"room_id"`
	Room                  *Room             `gorm:"foreignKey:RoomID" json:"room,omitempty"`
	CheckInDate           string            `gorm:"type:date;not null" json:"check_in_date"`
	ActualCheckInDate     *string           `gorm:"type:date" json:"actual_check_in_date"`
	ExpectedCheckOutDate  string            `gorm:"type:date" json:"expected_check_out_date"`
	ActualCheckOutDate    *string           `gorm:"type:date" json:"actual_check_out_date"`
	Status                ReservationStatus `gorm:"type:varchar(20);not null;default:'ACTIVE'" json:"status"`
	CreatedAt             time.Time         `json:"created_at"`
	UpdatedAt             time.Time         `json:"updated_at"`
}

func (r *Reservation) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}
