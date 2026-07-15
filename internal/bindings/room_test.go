// internal/bindings/room_test.go
package bindings

import (
	"testing"

	"github.com/econ/econ/internal/repository"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
	"github.com/google/uuid"
)

func TestRoom_TypesAndRooms(t *testing.T) {
	db := openTestDB(t)
	sess := session.New()
	sess.Set(uuid.New())
	b := NewRoomBinding(services.NewRoomService(repository.NewRoomRepository(db)), sess)

	rt, err := b.CreateRoomType(RoomTypeInput{Name: "Deluxe", DefaultRate: 1500})
	if err != nil {
		t.Fatal(err)
	}
	if rt.Name != "Deluxe" {
		t.Fatalf("got %q", rt.Name)
	}

	rm, err := b.CreateRoom(RoomInput{RoomNumber: "101", TypeID: rt.ID.String(), Status: "AVAILABLE"})
	if err != nil {
		t.Fatal(err)
	}
	if rm.RoomNumber != "101" {
		t.Fatalf("got %q", rm.RoomNumber)
	}

	rooms, _ := b.GetAllRooms()
	if len(rooms) != 1 {
		t.Fatalf("want 1 room, got %d", len(rooms))
	}
}
