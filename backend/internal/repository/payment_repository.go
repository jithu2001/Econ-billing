package repository

import (
	"trinity-lodge/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PaymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

func (r *PaymentRepository) Create(payment *models.Payment) error {
	return r.db.Create(payment).Error
}

func (r *PaymentRepository) FindByBillID(billID uuid.UUID) ([]models.Payment, error) {
	var payments []models.Payment
	err := r.db.Where("bill_id = ?", billID).Order("created_at DESC").Find(&payments).Error
	return payments, err
}

func (r *PaymentRepository) FindByID(id uuid.UUID) (*models.Payment, error) {
	var payment models.Payment
	err := r.db.First(&payment, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &payment, nil
}
