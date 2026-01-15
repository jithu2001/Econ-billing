package repository

import (
	"trinity-lodge/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CustomerRepository struct {
	db *gorm.DB
}

func NewCustomerRepository(db *gorm.DB) *CustomerRepository {
	return &CustomerRepository{db: db}
}

func (r *CustomerRepository) Create(customer *models.Customer) error {
	return r.db.Create(customer).Error
}

func (r *CustomerRepository) FindAll() ([]models.Customer, error) {
	var customers []models.Customer
	err := r.db.Order("created_at DESC").Find(&customers).Error
	return customers, err
}

func (r *CustomerRepository) FindByID(id uuid.UUID) (*models.Customer, error) {
	var customer models.Customer
	err := r.db.First(&customer, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &customer, nil
}

func (r *CustomerRepository) Update(customer *models.Customer) error {
	return r.db.Save(customer).Error
}

func (r *CustomerRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Customer{}, "id = ?", id).Error
}
