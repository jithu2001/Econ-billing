package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Settings struct {
	ID                    uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	LodgeName             string    `gorm:"type:varchar(255);not null" json:"lodge_name"`
	Address               string    `gorm:"type:text" json:"address"`
	Phone                 string    `gorm:"type:varchar(20)" json:"phone"`
	GSTNumber             string    `gorm:"type:varchar(20)" json:"gst_number"`
	StateName             string    `gorm:"type:varchar(100)" json:"state_name"`
	StateCode             string    `gorm:"type:varchar(10)" json:"state_code"`
	GSTInvoicePrefix      string    `gorm:"type:varchar(20);default:'GST'" json:"gst_invoice_prefix"`
	GSTInvoiceNextNumber  int       `gorm:"default:1" json:"gst_invoice_next_number"`
	NonGSTInvoicePrefix   string    `gorm:"type:varchar(20);default:'INV'" json:"non_gst_invoice_prefix"`
	NonGSTInvoiceNextNumber int     `gorm:"default:1" json:"non_gst_invoice_next_number"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

func (s *Settings) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}