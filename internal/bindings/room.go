// internal/bindings/room.go
package bindings

import (
	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
	"github.com/google/uuid"
)

type RoomTypeInput struct {
	Name        string  `json:"name"`
	DefaultRate float64 `json:"default_rate"`
}

type RoomInput struct {
	RoomNumber string            `json:"room_number"`
	TypeID     string            `json:"type_id"`
	Status     models.RoomStatus `json:"status"`
}

type RoomBinding struct {
	svc  *services.RoomService
	sess *session.Session
}

func NewRoomBinding(svc *services.RoomService, sess *session.Session) *RoomBinding {
	return &RoomBinding{svc: svc, sess: sess}
}

// Room Types
func (b *RoomBinding) GetAllRoomTypes() ([]models.RoomType, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	return b.svc.GetAllRoomTypes(uid)
}

func (b *RoomBinding) CreateRoomType(in RoomTypeInput) (*models.RoomType, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	rt := &models.RoomType{ID: uuid.New(), UserID: uid, Name: in.Name, DefaultRate: in.DefaultRate}
	if err := b.svc.CreateRoomType(rt); err != nil {
		return nil, err
	}
	return rt, nil
}

func (b *RoomBinding) UpdateRoomType(id string, in RoomTypeInput) (*models.RoomType, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	rtID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	rt := &models.RoomType{ID: rtID, UserID: uid, Name: in.Name, DefaultRate: in.DefaultRate}
	if err := b.svc.UpdateRoomType(rt); err != nil {
		return nil, err
	}
	return rt, nil
}

// Rooms
func (b *RoomBinding) GetAllRooms() ([]models.Room, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	return b.svc.GetAllRooms(uid)
}

func (b *RoomBinding) CreateRoom(in RoomInput) (*models.Room, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	typeID, err := uuid.Parse(in.TypeID)
	if err != nil {
		return nil, err
	}
	status := in.Status
	if status == "" {
		status = models.RoomStatusAvailable
	}
	r := &models.Room{ID: uuid.New(), UserID: uid, RoomNumber: in.RoomNumber, TypeID: typeID, Status: status}
	if err := b.svc.CreateRoom(r); err != nil {
		return nil, err
	}
	return r, nil
}

func (b *RoomBinding) UpdateRoom(id string, in RoomInput) (*models.Room, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	rID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}
	typeID, err := uuid.Parse(in.TypeID)
	if err != nil {
		return nil, err
	}
	r := &models.Room{ID: rID, UserID: uid, RoomNumber: in.RoomNumber, TypeID: typeID, Status: in.Status}
	if err := b.svc.UpdateRoom(r); err != nil {
		return nil, err
	}
	return r, nil
}
