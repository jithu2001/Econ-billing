package services

import (
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/repository"

	"github.com/google/uuid"
)

type PaymentService struct {
	repo     *repository.PaymentRepository
	billRepo *repository.BillRepository
}

func NewPaymentService(repo *repository.PaymentRepository, billRepo *repository.BillRepository) *PaymentService {
	return &PaymentService{
		repo:     repo,
		billRepo: billRepo,
	}
}

func (s *PaymentService) CreatePayment(payment *models.Payment) error {
	err := s.repo.Create(payment)
	if err != nil {
		return err
	}

	// Get bill to check if fully paid
	bill, err := s.billRepo.FindByID(payment.BillID)
	if err != nil {
		return nil // Payment created successfully, just can't update bill status
	}

	// Get all payments for this bill
	payments, err := s.repo.FindByBillID(payment.BillID)
	if err != nil {
		return nil
	}

	// Calculate total paid
	var totalPaid float64
	for _, p := range payments {
		totalPaid += p.Amount
	}

	// Update bill status if fully paid
	if totalPaid >= bill.TotalAmount {
		s.billRepo.UpdateStatus(payment.BillID, models.BillStatusPaid)
	}

	return nil
}

func (s *PaymentService) GetPaymentsByBillID(billID uuid.UUID) ([]models.Payment, error) {
	return s.repo.FindByBillID(billID)
}
