package services

import (
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/repository"

	"github.com/google/uuid"
)

type BillService struct {
	repo *repository.BillRepository
}

func NewBillService(repo *repository.BillRepository) *BillService {
	return &BillService{repo: repo}
}

func (s *BillService) CreateBill(bill *models.Bill, lineItems []models.BillLineItem) error {
	// Create bill first
	err := s.repo.Create(bill)
	if err != nil {
		return err
	}

	// Set bill_id for all line items
	for i := range lineItems {
		lineItems[i].BillID = bill.ID
	}

	// Create line items
	if len(lineItems) > 0 {
		return s.repo.CreateLineItems(lineItems)
	}

	return nil
}

func (s *BillService) GetBillByID(id uuid.UUID) (*models.Bill, error) {
	return s.repo.FindByID(id)
}

func (s *BillService) GetBillsByCustomerID(customerID uuid.UUID) ([]models.Bill, error) {
	return s.repo.FindByCustomerID(customerID)
}

func (s *BillService) GetAllBills() ([]models.Bill, error) {
	return s.repo.FindAll()
}

func (s *BillService) UpdateBill(bill *models.Bill) error {
	return s.repo.Update(bill)
}

func (s *BillService) FinalizeBill(id uuid.UUID) error {
	return s.repo.UpdateStatus(id, models.BillStatusFinalized)
}

func (s *BillService) UpdateBillStatus(id uuid.UUID, status models.BillStatus) error {
	return s.repo.UpdateStatus(id, status)
}
