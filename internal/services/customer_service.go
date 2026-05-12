package services

import (
	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/repository"

	"github.com/google/uuid"
)

type CustomerService struct {
	repo *repository.CustomerRepository
}

func NewCustomerService(repo *repository.CustomerRepository) *CustomerService {
	return &CustomerService{repo: repo}
}

func (s *CustomerService) CreateCustomer(customer *models.Customer) error {
	return s.repo.Create(customer)
}

func (s *CustomerService) GetAllCustomers(userID uuid.UUID) ([]models.Customer, error) {
	return s.repo.FindAll(userID)
}

func (s *CustomerService) GetCustomerByID(id uuid.UUID, userID uuid.UUID) (*models.Customer, error) {
	return s.repo.FindByID(id, userID)
}

func (s *CustomerService) UpdateCustomer(customer *models.Customer) error {
	return s.repo.Update(customer)
}

func (s *CustomerService) DeleteCustomer(id uuid.UUID, userID uuid.UUID) error {
	return s.repo.Delete(id, userID)
}
