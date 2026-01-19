package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BillType string
type BillStatus string

const (
	BillTypeRoom   BillType = "ROOM"
	BillTypeWalkIn BillType = "WALK_IN"
	BillTypeFood   BillType = "FOOD"
	BillTypeManual BillType = "MANUAL"

	BillStatusDraft     BillStatus = "DRAFT"
	BillStatusFinalized BillStatus = "FINALIZED"
	BillStatusPaid      BillStatus = "PAID"
	BillStatusUnpaid    BillStatus = "UNPAID"
)

type Bill struct {
	ID             uuid.UUID    `gorm:"type:uuid;primaryKey" json:"id"`
	CustomerID     uuid.UUID    `gorm:"type:uuid;not null" json:"customer_id"`
	Customer       *Customer    `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	ReservationID  *uuid.UUID   `gorm:"type:uuid" json:"reservation_id"`
	Reservation    *Reservation `gorm:"foreignKey:ReservationID" json:"reservation,omitempty"`
	BillType       BillType     `gorm:"type:varchar(20);not null" json:"bill_type"`
	BillDate       string       `gorm:"type:date;not null" json:"bill_date"`
	InvoiceNumber  string       `gorm:"type:varchar(50)" json:"invoice_number"`
	IsGSTBill      bool         `gorm:"default:false" json:"is_gst_bill"`
	Subtotal       float64      `gorm:"not null;default:0" json:"subtotal"`
	TaxAmount      float64      `gorm:"not null;default:0" json:"tax_amount"`
	DiscountAmount float64      `gorm:"not null;default:0" json:"discount_amount"`
	TotalAmount    float64      `gorm:"not null;default:0" json:"total_amount"`
	Status         BillStatus   `gorm:"type:varchar(20);not null;default:'DRAFT'" json:"status"`
	GeneratedBy    uuid.UUID    `gorm:"type:uuid;not null" json:"generated_by"`
	CreatedAt      time.Time    `json:"created_at"`
	UpdatedAt      time.Time    `json:"updated_at"`
	LineItems      []BillLineItem `gorm:"foreignKey:BillID" json:"line_items,omitempty"`
}

func (b *Bill) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

type BillLineItem struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	BillID      uuid.UUID `gorm:"type:uuid;not null" json:"bill_id"`
	Description string    `gorm:"not null" json:"description"`
	Amount      float64   `gorm:"not null" json:"amount"`
	CreatedAt   time.Time `json:"created_at"`
}

func (bli *BillLineItem) BeforeCreate(tx *gorm.DB) error {
	if bli.ID == uuid.Nil {
		bli.ID = uuid.New()
	}
	return nil
}
