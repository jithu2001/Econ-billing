package repository

import (
	"trinity-lodge/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BillRepository struct {
	db *gorm.DB
}

func NewBillRepository(db *gorm.DB) *BillRepository {
	return &BillRepository{db: db}
}

func (r *BillRepository) Create(bill *models.Bill) error {
	return r.db.Create(bill).Error
}

func (r *BillRepository) FindByID(id uuid.UUID) (*models.Bill, error) {
	var bill models.Bill
	err := r.db.Preload("Customer").
		Preload("Reservation.Room.Type").
		Preload("LineItems").
		First(&bill, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &bill, nil
}

func (r *BillRepository) FindByCustomerID(customerID uuid.UUID) ([]models.Bill, error) {
	var bills []models.Bill
	err := r.db.Preload("Reservation").
		Preload("LineItems").
		Where("customer_id = ?", customerID).
		Order("created_at DESC").
		Find(&bills).Error
	return bills, err
}

func (r *BillRepository) FindAll() ([]models.Bill, error) {
	var bills []models.Bill
	err := r.db.Preload("Customer").
		Preload("Reservation").
		Order("created_at DESC").
		Find(&bills).Error
	return bills, err
}

func (r *BillRepository) Update(bill *models.Bill) error {
	return r.db.Save(bill).Error
}

func (r *BillRepository) UpdateStatus(id uuid.UUID, status models.BillStatus) error {
	return r.db.Model(&models.Bill{}).Where("id = ?", id).Update("status", status).Error
}

// Line Items
func (r *BillRepository) CreateLineItem(lineItem *models.BillLineItem) error {
	return r.db.Create(lineItem).Error
}

func (r *BillRepository) CreateLineItems(lineItems []models.BillLineItem) error {
	return r.db.Create(&lineItems).Error
}
