// internal/bindings/bill.go
package bindings

import (
	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
	"github.com/google/uuid"
)

type BillLineItemInput struct {
	Description string  `json:"description"`
	Amount      float64 `json:"amount"`
}

type BillInput struct {
	CustomerID        string              `json:"customer_id"`
	ReservationID     *string             `json:"reservation_id"`
	BillType          models.BillType     `json:"bill_type"`
	BillDate          string              `json:"bill_date"`
	IsGSTBill         bool                `json:"is_gst_bill"`
	GSTInclusive      bool                `json:"gst_inclusive"`
	Subtotal          float64             `json:"subtotal"`
	TaxAmount         float64             `json:"tax_amount"`
	DiscountAmount    float64             `json:"discount_amount"`
	TotalAmount       float64             `json:"total_amount"`
	ArrivalDateTime   *string             `json:"arrival_datetime"`
	DepartureDateTime *string             `json:"departure_datetime"`
	Status            models.BillStatus   `json:"status"`
	LineItems         []BillLineItemInput `json:"line_items"`
}

type BillBinding struct {
	svc  *services.BillService
	sess *session.Session
}

func NewBillBinding(svc *services.BillService, sess *session.Session) *BillBinding {
	return &BillBinding{svc: svc, sess: sess}
}

func (b *BillBinding) Create(in BillInput) (*models.Bill, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	custID, err := uuid.Parse(in.CustomerID)
	if err != nil {
		return nil, err
	}
	var resID *uuid.UUID
	if in.ReservationID != nil && *in.ReservationID != "" {
		v, err := uuid.Parse(*in.ReservationID)
		if err != nil {
			return nil, err
		}
		resID = &v
	}
	status := in.Status
	if status == "" {
		status = models.BillStatusDraft
	}
	bill := &models.Bill{
		ID: uuid.New(), UserID: uid,
		CustomerID: custID, ReservationID: resID,
		BillType: in.BillType, BillDate: in.BillDate,
		IsGSTBill:         in.IsGSTBill,
		GSTInclusive:      in.GSTInclusive,
		Subtotal:          in.Subtotal,
		TaxAmount:         in.TaxAmount,
		DiscountAmount:    in.DiscountAmount,
		TotalAmount:       in.TotalAmount,
		ArrivalDateTime:   in.ArrivalDateTime,
		DepartureDateTime: in.DepartureDateTime,
		Status:            status,
		GeneratedBy:       uid,
	}
	lineItems := make([]models.BillLineItem, len(in.LineItems))
	for i, li := range in.LineItems {
		lineItems[i] = models.BillLineItem{
			ID: uuid.New(), Description: li.Description, Amount: li.Amount,
		}
	}
	if err := b.svc.CreateBill(bill, lineItems); err != nil {
		return nil, err
	}
	return bill, nil
}

func (b *BillBinding) Update(id string, in BillInput) (*models.Bill, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	bid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	existing, err := b.svc.GetBillByID(bid, uid)
	if err != nil {
		return nil, err
	}

	// Apply editable fields; preserve identity (invoice number, customer,
	// reservation, status, dates, timestamps, generated_by).
	existing.IsGSTBill = in.IsGSTBill
	existing.GSTInclusive = in.GSTInclusive
	existing.Subtotal = in.Subtotal
	existing.TaxAmount = in.TaxAmount
	existing.DiscountAmount = in.DiscountAmount
	existing.TotalAmount = in.TotalAmount
	existing.ArrivalDateTime = in.ArrivalDateTime
	existing.DepartureDateTime = in.DepartureDateTime

	// Clear preloaded associations so GORM Save does not try to upsert them.
	existing.Customer = nil
	existing.Reservation = nil
	existing.LineItems = nil

	lineItems := make([]models.BillLineItem, len(in.LineItems))
	for i, li := range in.LineItems {
		lineItems[i] = models.BillLineItem{
			ID: uuid.New(), BillID: existing.ID, Description: li.Description, Amount: li.Amount,
		}
	}

	if err := b.svc.UpdateBillWithLineItems(existing, lineItems); err != nil {
		return nil, err
	}
	return existing, nil
}

func (b *BillBinding) GetByID(id string) (*models.Bill, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	bid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return b.svc.GetBillByID(bid, uid)
}

func (b *BillBinding) GetByCustomerID(customerID string) ([]models.Bill, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	cid, err := uuid.Parse(customerID)
	if err != nil {
		return nil, err
	}
	return b.svc.GetBillsByCustomerID(cid, uid)
}

func (b *BillBinding) Finalize(id string) error {
	uid, err := b.sess.UserID()
	if err != nil {
		return err
	}
	bid, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return b.svc.FinalizeBill(bid, uid)
}
