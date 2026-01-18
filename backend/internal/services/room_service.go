package services

import (
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/repository"

	"github.com/google/uuid"
)

type RoomService struct {
	repo *repository.RoomRepository
}

func NewRoomService(repo *repository.RoomRepository) *RoomService {
	return &RoomService{repo: repo}
}

// Room Type methods
func (s *RoomService) CreateRoomType(roomType *models.RoomType) error {
	return s.repo.CreateRoomType(roomType)
}

func (s *RoomService) GetAllRoomTypes() ([]models.RoomType, error) {
	return s.repo.FindAllRoomTypes()
}

func (s *RoomService) GetRoomTypeByID(id uuid.UUID) (*models.RoomType, error) {
	return s.repo.FindRoomTypeByID(id)
}

func (s *RoomService) UpdateRoomType(roomType *models.RoomType) error {
	return s.repo.UpdateRoomType(roomType)
}

// Room methods
func (s *RoomService) CreateRoom(room *models.Room) error {
	return s.repo.CreateRoom(room)
}

func (s *RoomService) GetAllRooms() ([]models.Room, error) {
	return s.repo.FindAllRooms()
}

func (s *RoomService) GetRoomByID(id uuid.UUID) (*models.Room, error) {
	return s.repo.FindRoomByID(id)
}

func (s *RoomService) UpdateRoom(room *models.Room) error {
	return s.repo.UpdateRoom(room)
}

func (s *RoomService) UpdateRoomStatus(id uuid.UUID, status models.RoomStatus) error {
	return s.repo.UpdateRoomStatus(id, status)
}
