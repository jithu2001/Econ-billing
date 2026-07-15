package repository

import (
	"github.com/econ/econ/internal/models"

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

func (r *CustomerRepository) FindAll(userID uuid.UUID) ([]models.Customer, error) {
	var customers []models.Customer
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&customers).Error
	return customers, err
}

func (r *CustomerRepository) FindByID(id uuid.UUID, userID uuid.UUID) (*models.Customer, error) {
	var customer models.Customer
	err := r.db.First(&customer, "id = ? AND user_id = ?", id, userID).Error
	if err != nil {
		return nil, err
	}
	return &customer, nil
}

func (r *CustomerRepository) Update(customer *models.Customer) error {
	return r.db.Save(customer).Error
}

func (r *CustomerRepository) Delete(id uuid.UUID, userID uuid.UUID) error {
	return r.db.Delete(&models.Customer{}, "id = ? AND user_id = ?", id, userID).Error
}
