// internal/bindings/payment_test.go
package bindings

import (
	"testing"

	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/repository"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
	"github.com/google/uuid"
)

func TestPayment_CreateMarksBillPaid(t *testing.T) {
	db := openTestDB(t)
	uid := uuid.New()
	sess := session.New()
	sess.Set(uid)

	settingsRepo := repository.NewSettingsRepository(db)
	settingsRepo.CreateDefaultSettings(uid)
	custRepo := repository.NewCustomerRepository(db)
	cust := &models.Customer{ID: uuid.New(), UserID: uid, FullName: "C", Phone: "1"}
	custRepo.Create(cust)
	billRepo := repository.NewBillRepository(db)
	bill := &models.Bill{
		ID: uuid.New(), UserID: uid, CustomerID: cust.ID,
		BillType: models.BillTypeWalkIn, BillDate: "2026-05-12",
		TotalAmount: 100, Status: models.BillStatusUnpaid, GeneratedBy: uid,
		InvoiceNumber: "INV-0001",
	}
	billRepo.Create(bill)

	pay := NewPaymentBinding(
		services.NewPaymentService(repository.NewPaymentRepository(db), billRepo),
		sess,
	)
	_, err := pay.Create(bill.ID.String(), PaymentInput{Amount: 100, PaymentMethod: "Cash", PaymentDate: "2026-05-12"})
	if err != nil {
		t.Fatal(err)
	}

	got, _ := billRepo.FindByID(bill.ID, uid)
	if got.Status != models.BillStatusPaid {
		t.Fatalf("expected PAID, got %q", got.Status)
	}
}
