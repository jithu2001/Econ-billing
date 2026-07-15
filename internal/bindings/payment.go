// internal/bindings/payment.go
package bindings

import (
	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
	"github.com/google/uuid"
)

type PaymentInput struct {
	Amount        float64              `json:"amount"`
	PaymentMethod models.PaymentMethod `json:"payment_method"`
	PaymentDate   string               `json:"payment_date"`
}

type PaymentBinding struct {
	svc  *services.PaymentService
	sess *session.Session
}

func NewPaymentBinding(svc *services.PaymentService, sess *session.Session) *PaymentBinding {
	return &PaymentBinding{svc: svc, sess: sess}
}

func (b *PaymentBinding) Create(billID string, in PaymentInput) (*models.Payment, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	bid, err := uuid.Parse(billID)
	if err != nil {
		return nil, err
	}
	p := &models.Payment{
		ID: uuid.New(), BillID: bid,
		Amount: in.Amount, PaymentMethod: in.PaymentMethod, PaymentDate: in.PaymentDate,
	}
	if err := b.svc.CreatePayment(p, uid); err != nil {
		return nil, err
	}
	return p, nil
}

func (b *PaymentBinding) GetByBillID(billID string) ([]models.Payment, error) {
	if _, err := b.sess.UserID(); err != nil {
		return nil, err
	}
	bid, err := uuid.Parse(billID)
	if err != nil {
		return nil, err
	}
	return b.svc.GetPaymentsByBillID(bid)
}
