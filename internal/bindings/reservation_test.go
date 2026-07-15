// internal/bindings/reservation_test.go
package bindings

import (
	"testing"

	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/repository"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
	"github.com/google/uuid"
)

func TestReservation_CreateCheckInCheckout(t *testing.T) {
	db := openTestDB(t)
	uid := uuid.New()
	sess := session.New()
	sess.Set(uid)

	custSvc := services.NewCustomerService(repository.NewCustomerRepository(db))
	cust := &models.Customer{ID: uuid.New(), UserID: uid, FullName: "C", Phone: "1"}
	custSvc.CreateCustomer(cust)

	roomSvc := services.NewRoomService(repository.NewRoomRepository(db))
	rt := &models.RoomType{ID: uuid.New(), UserID: uid, Name: "Std", DefaultRate: 100}
	roomSvc.CreateRoomType(rt)
	room := &models.Room{ID: uuid.New(), UserID: uid, RoomNumber: "1", TypeID: rt.ID, Status: models.RoomStatusAvailable}
	roomSvc.CreateRoom(room)

	b := NewReservationBinding(
		services.NewReservationService(
			repository.NewReservationRepository(db),
			repository.NewRoomRepository(db),
		),
		sess,
	)

	r, err := b.Create(ReservationInput{
		CustomerID: cust.ID.String(), RoomID: room.ID.String(),
		CheckInDate: "2026-05-12", ExpectedCheckOutDate: "2026-05-14",
	})
	if err != nil {
		t.Fatal(err)
	}
	if err := b.CheckIn(r.ID.String()); err != nil {
		t.Fatal(err)
	}
	if err := b.Checkout(r.ID.String(), "2026-05-14"); err != nil {
		t.Fatal(err)
	}
}
