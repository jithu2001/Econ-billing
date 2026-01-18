package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RoomStatus string

const (
	RoomStatusAvailable   RoomStatus = "AVAILABLE"
	RoomStatusOccupied    RoomStatus = "OCCUPIED"
	RoomStatusMaintenance RoomStatus = "MAINTENANCE"
)

type RoomType struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	DefaultRate float64   `gorm:"not null" json:"default_rate"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (rt *RoomType) BeforeCreate(tx *gorm.DB) error {
	if rt.ID == uuid.Nil {
		rt.ID = uuid.New()
	}
	return nil
}

type Room struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	RoomNumber string     `gorm:"unique;not null" json:"room_number"`
	TypeID     uuid.UUID  `gorm:"type:uuid;not null" json:"type_id"`
	Type       *RoomType  `gorm:"foreignKey:TypeID" json:"type,omitempty"`
	Status     RoomStatus `gorm:"type:varchar(20);not null;default:'AVAILABLE'" json:"status"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

func (r *Room) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}
