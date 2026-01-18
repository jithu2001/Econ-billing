package services

import (
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/repository"

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

func (s *CustomerService) GetAllCustomers() ([]models.Customer, error) {
	return s.repo.FindAll()
}

func (s *CustomerService) GetCustomerByID(id uuid.UUID) (*models.Customer, error) {
	return s.repo.FindByID(id)
}

func (s *CustomerService) UpdateCustomer(customer *models.Customer) error {
	return s.repo.Update(customer)
}

func (s *CustomerService) DeleteCustomer(id uuid.UUID) error {
	return s.repo.Delete(id)
}
