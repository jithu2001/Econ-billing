package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PaymentMethod string

const (
	PaymentMethodCash PaymentMethod = "Cash"
	PaymentMethodCard PaymentMethod = "Card"
	PaymentMethodUPI  PaymentMethod = "UPI"
)

type Payment struct {
	ID            uuid.UUID     `gorm:"type:uuid;primaryKey" json:"id"`
	BillID        uuid.UUID     `gorm:"type:uuid;not null" json:"bill_id"`
	Bill          *Bill         `gorm:"foreignKey:BillID" json:"bill,omitempty"`
	Amount        float64       `gorm:"not null" json:"amount"`
	PaymentMethod PaymentMethod `gorm:"type:varchar(10);not null" json:"payment_method"`
	PaymentDate   string        `gorm:"type:date;not null" json:"payment_date"`
	CreatedAt     time.Time     `json:"created_at"`
}

func (p *Payment) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
