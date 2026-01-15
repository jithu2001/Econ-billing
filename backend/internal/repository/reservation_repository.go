package repository

import (
	"trinity-lodge/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ReservationRepository struct {
	db *gorm.DB
}

func NewReservationRepository(db *gorm.DB) *ReservationRepository {
	return &ReservationRepository{db: db}
}

func (r *ReservationRepository) Create(reservation *models.Reservation) error {
	return r.db.Create(reservation).Error
}

func (r *ReservationRepository) FindAll() ([]models.Reservation, error) {
	var reservations []models.Reservation
	err := r.db.Preload("Customer").Preload("Room.Type").Order("created_at DESC").Find(&reservations).Error
	return reservations, err
}

func (r *ReservationRepository) FindByID(id uuid.UUID) (*models.Reservation, error) {
	var reservation models.Reservation
	err := r.db.Preload("Customer").Preload("Room.Type").First(&reservation, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &reservation, nil
}

func (r *ReservationRepository) FindByCustomerID(customerID uuid.UUID) ([]models.Reservation, error) {
	var reservations []models.Reservation
	err := r.db.Preload("Room.Type").Where("customer_id = ?", customerID).Order("created_at DESC").Find(&reservations).Error
	return reservations, err
}

func (r *ReservationRepository) Update(reservation *models.Reservation) error {
	return r.db.Save(reservation).Error
}

func (r *ReservationRepository) UpdateStatus(id uuid.UUID, status models.ReservationStatus) error {
	return r.db.Model(&models.Reservation{}).Where("id = ?", id).Update("status", status).Error
}

func (r *ReservationRepository) FindOverlappingReservations(roomID uuid.UUID, checkInDate, checkOutDate string) ([]models.Reservation, error) {
	var reservations []models.Reservation
	// Find active reservations for the room where dates overlap
	// Overlap occurs when: new check-in < existing check-out AND new check-out > existing check-in
	err := r.db.Where("room_id = ? AND status = ? AND check_in_date < ? AND expected_check_out_date > ?",
		roomID, models.ReservationStatusActive, checkOutDate, checkInDate).Find(&reservations).Error
	return reservations, err
}
