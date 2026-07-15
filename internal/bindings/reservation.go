// internal/bindings/reservation.go
package bindings

import (
	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
	"github.com/google/uuid"
)

type ReservationInput struct {
	CustomerID           string `json:"customer_id"`
	RoomID               string `json:"room_id"`
	CheckInDate          string `json:"check_in_date"`
	ExpectedCheckOutDate string `json:"expected_check_out_date"`
}

type ReservationBinding struct {
	svc  *services.ReservationService
	sess *session.Session
}

func NewReservationBinding(svc *services.ReservationService, sess *session.Session) *ReservationBinding {
	return &ReservationBinding{svc: svc, sess: sess}
}

func (b *ReservationBinding) GetAll() ([]models.Reservation, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	return b.svc.GetAllReservations(uid)
}

func (b *ReservationBinding) GetByID(id string) (*models.Reservation, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	rid, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	return b.svc.GetReservationByID(rid, uid)
}

func (b *ReservationBinding) Create(in ReservationInput) (*models.Reservation, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	cust, err := uuid.Parse(in.CustomerID)
	if err != nil {
		return nil, err
	}
	room, err := uuid.Parse(in.RoomID)
	if err != nil {
		return nil, err
	}
	r := &models.Reservation{
		ID: uuid.New(), UserID: uid,
		CustomerID: cust, RoomID: room,
		CheckInDate:          in.CheckInDate,
		ExpectedCheckOutDate: in.ExpectedCheckOutDate,
		Status:               models.ReservationStatusActive,
	}
	if err := b.svc.CreateReservation(r); err != nil {
		return nil, err
	}
	return r, nil
}

func (b *ReservationBinding) CheckIn(id string) error {
	uid, err := b.sess.UserID()
	if err != nil {
		return err
	}
	rid, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return b.svc.CheckInReservation(rid, uid)
}

func (b *ReservationBinding) Cancel(id string) error {
	uid, err := b.sess.UserID()
	if err != nil {
		return err
	}
	rid, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return b.svc.CancelReservation(rid, uid)
}

func (b *ReservationBinding) Checkout(id, checkoutDate string) error {
	uid, err := b.sess.UserID()
	if err != nil {
		return err
	}
	rid, err := uuid.Parse(id)
	if err != nil {
		return err
	}
	return b.svc.CheckoutReservation(rid, uid, checkoutDate)
}
