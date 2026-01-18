package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Customer struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	FullName      string    `gorm:"not null" json:"full_name"`
	Phone         string    `gorm:"not null" json:"phone"`
	Address       string    `json:"address"`
	IDProofType   string    `json:"id_proof_type"`
	IDProofNumber string    `json:"id_proof_number"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (c *Customer) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}
