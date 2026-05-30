// internal/bindings/bill_test.go
package bindings

import (
	"strings"
	"testing"

	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/repository"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
	"github.com/google/uuid"
)

func TestBill_GSTInvoiceNumberFormat(t *testing.T) {
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
	b := NewBillBinding(services.NewBillService(billRepo, settingsRepo), sess)

	bill, err := b.Create(BillInput{
		CustomerID: cust.ID.String(),
		BillType:   models.BillTypeWalkIn,
		BillDate:   "2026-05-12", IsGSTBill: true,
		Subtotal: 100, TaxAmount: 18, TotalAmount: 118,
		Status: models.BillStatusDraft,
	})
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(bill.InvoiceNumber, "GST-") {
		t.Fatalf("expected GST- prefix, got %q", bill.InvoiceNumber)
	}
	if bill.InvoiceNumber != "GST-0001" {
		t.Fatalf("expected GST-0001 (zero-padded), got %q", bill.InvoiceNumber)
	}
}
