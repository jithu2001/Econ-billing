package services

import (
	"fmt"
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/repository"

	"github.com/google/uuid"
)

type BillService struct {
	repo         *repository.BillRepository
	settingsRepo *repository.SettingsRepository
}

func NewBillService(repo *repository.BillRepository, settingsRepo *repository.SettingsRepository) *BillService {
	return &BillService{repo: repo, settingsRepo: settingsRepo}
}

func (s *BillService) CreateBill(bill *models.Bill, lineItems []models.BillLineItem) error {
	// Generate invoice number based on whether it's a GST bill
	var prefix string
	var number int
	var err error

	if bill.IsGSTBill {
		prefix, number, err = s.settingsRepo.GetAndIncrementGSTInvoiceNumber(bill.UserID)
	} else {
		prefix, number, err = s.settingsRepo.GetAndIncrementNonGSTInvoiceNumber(bill.UserID)
	}

	if err != nil {
		return fmt.Errorf("failed to generate invoice number: %w", err)
	}

	// Format invoice number: PREFIX-0001
	bill.InvoiceNumber = fmt.Sprintf("%s-%04d", prefix, number)

	// Create bill first
	err = s.repo.Create(bill)
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

func (s *BillService) GetBillByID(id uuid.UUID, userID uuid.UUID) (*models.Bill, error) {
	return s.repo.FindByID(id, userID)
}

func (s *BillService) GetBillsByCustomerID(customerID uuid.UUID, userID uuid.UUID) ([]models.Bill, error) {
	return s.repo.FindByCustomerID(customerID, userID)
}

func (s *BillService) GetAllBills(userID uuid.UUID) ([]models.Bill, error) {
	return s.repo.FindAll(userID)
}

func (s *BillService) UpdateBill(bill *models.Bill) error {
	return s.repo.Update(bill)
}

func (s *BillService) FinalizeBill(id uuid.UUID, userID uuid.UUID) error {
	return s.repo.UpdateStatus(id, userID, models.BillStatusFinalized)
}

func (s *BillService) UpdateBillStatus(id uuid.UUID, userID uuid.UUID, status models.BillStatus) error {
	return s.repo.UpdateStatus(id, userID, status)
}
