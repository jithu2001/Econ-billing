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

func (r *RoomRepository) FindAllRoomTypes(userID uuid.UUID) ([]models.RoomType, error) {
	var roomTypes []models.RoomType
	err := r.db.Where("user_id = ?", userID).Order("name").Find(&roomTypes).Error
	return roomTypes, err
}

func (r *RoomRepository) FindRoomTypeByID(id uuid.UUID, userID uuid.UUID) (*models.RoomType, error) {
	var roomType models.RoomType
	err := r.db.First(&roomType, "id = ? AND user_id = ?", id, userID).Error
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

func (r *RoomRepository) FindAllRooms(userID uuid.UUID) ([]models.Room, error) {
	var rooms []models.Room
	err := r.db.Preload("Type").Where("user_id = ?", userID).Order("room_number").Find(&rooms).Error
	return rooms, err
}

func (r *RoomRepository) FindRoomByID(id uuid.UUID, userID uuid.UUID) (*models.Room, error) {
	var room models.Room
	err := r.db.Preload("Type").First(&room, "id = ? AND user_id = ?", id, userID).Error
	if err != nil {
		return nil, err
	}
	return &room, nil
}

func (r *RoomRepository) UpdateRoom(room *models.Room) error {
	return r.db.Save(room).Error
}

func (r *RoomRepository) UpdateRoomStatus(id uuid.UUID, userID uuid.UUID, status models.RoomStatus) error {
	return r.db.Model(&models.Room{}).Where("id = ? AND user_id = ?", id, userID).Update("status", status).Error
}
