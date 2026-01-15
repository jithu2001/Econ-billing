package repository

import (
	"trinity-lodge/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RoomRepository struct {
	db *gorm.DB
}

func NewRoomRepository(db *gorm.DB) *RoomRepository {
	return &RoomRepository{db: db}
}

// Room Type methods
func (r *RoomRepository) CreateRoomType(roomType *models.RoomType) error {
	return r.db.Create(roomType).Error
}

func (r *RoomRepository) FindAllRoomTypes() ([]models.RoomType, error) {
	var roomTypes []models.RoomType
	err := r.db.Order("name").Find(&roomTypes).Error
	return roomTypes, err
}

func (r *RoomRepository) FindRoomTypeByID(id uuid.UUID) (*models.RoomType, error) {
	var roomType models.RoomType
	err := r.db.First(&roomType, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &roomType, nil
}

func (r *RoomRepository) UpdateRoomType(roomType *models.RoomType) error {
	return r.db.Save(roomType).Error
}

// Room methods
func (r *RoomRepository) CreateRoom(room *models.Room) error {
	return r.db.Create(room).Error
}

func (r *RoomRepository) FindAllRooms() ([]models.Room, error) {
	var rooms []models.Room
	err := r.db.Preload("Type").Order("room_number").Find(&rooms).Error
	return rooms, err
}

func (r *RoomRepository) FindRoomByID(id uuid.UUID) (*models.Room, error) {
	var room models.Room
	err := r.db.Preload("Type").First(&room, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &room, nil
}

func (r *RoomRepository) UpdateRoom(room *models.Room) error {
	return r.db.Save(room).Error
}

func (r *RoomRepository) UpdateRoomStatus(id uuid.UUID, status models.RoomStatus) error {
	return r.db.Model(&models.Room{}).Where("id = ?", id).Update("status", status).Error
}
