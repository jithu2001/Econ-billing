package services

import (
	"errors"
	"time"
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/repository"

	"github.com/google/uuid"
)

type ReservationService struct {
	repo     *repository.ReservationRepository
	roomRepo *repository.RoomRepository
}

func NewReservationService(repo *repository.ReservationRepository, roomRepo *repository.RoomRepository) *ReservationService {
	return &ReservationService{
		repo:     repo,
		roomRepo: roomRepo,
	}
}

func (s *ReservationService) CreateReservation(reservation *models.Reservation) error {
	// Check if room exists
	room, err := s.roomRepo.FindRoomByID(reservation.RoomID)
	if err != nil {
		return err
	}

	// Check for overlapping reservations
	overlapping, err := s.repo.FindOverlappingReservations(
		reservation.RoomID,
		reservation.CheckInDate,
		reservation.ExpectedCheckOutDate,
	)
	if err != nil {
		return err
	}

	if len(overlapping) > 0 {
		return errors.New("room is already reserved for the selected dates")
	}

	// Check if room is currently occupied (for same-day bookings)
	if room.Status == models.RoomStatusOccupied {
		return errors.New("room is currently occupied")
	}

	// Create reservation
	err = s.repo.Create(reservation)
	if err != nil {
		return err
	}

	return nil
}

func (s *ReservationService) GetAllReservations() ([]models.Reservation, error) {
	return s.repo.FindAll()
}

func (s *ReservationService) GetReservationByID(id uuid.UUID) (*models.Reservation, error) {
	return s.repo.FindByID(id)
}

func (s *ReservationService) GetReservationsByCustomerID(customerID uuid.UUID) ([]models.Reservation, error) {
	return s.repo.FindByCustomerID(customerID)
}

func (s *ReservationService) UpdateReservation(reservation *models.Reservation) error {
	return s.repo.Update(reservation)
}

func (s *ReservationService) CheckInReservation(id uuid.UUID) error {
	reservation, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if reservation.Status != models.ReservationStatusActive {
		return errors.New("only active reservations can be checked in")
	}

	if reservation.ActualCheckInDate != nil {
		return errors.New("reservation is already checked in")
	}

	// Set actual check-in date
	today := time.Now().Format("2006-01-02")
	reservation.ActualCheckInDate = &today

	// Update reservation
	err = s.repo.Update(reservation)
	if err != nil {
		return err
	}

	// Update room status to occupied
	return s.roomRepo.UpdateRoomStatus(reservation.RoomID, models.RoomStatusOccupied)
}

func (s *ReservationService) CancelReservation(id uuid.UUID) error {
	reservation, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	if reservation.Status != models.ReservationStatusActive {
		return errors.New("only active reservations can be cancelled")
	}

	// Update reservation status to cancelled
	reservation.Status = models.ReservationStatusCancelled
	err = s.repo.Update(reservation)
	if err != nil {
		return err
	}

	// If room was occupied, make it available again
	room, err := s.roomRepo.FindRoomByID(reservation.RoomID)
	if err == nil && room.Status == models.RoomStatusOccupied {
		return s.roomRepo.UpdateRoomStatus(reservation.RoomID, models.RoomStatusAvailable)
	}

	return nil
}

func (s *ReservationService) CheckoutReservation(id uuid.UUID, checkoutDate string) error {
	reservation, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	// Update reservation status
	reservation.ActualCheckOutDate = &checkoutDate
	reservation.Status = models.ReservationStatusCompleted
	err = s.repo.Update(reservation)
	if err != nil {
		return err
	}

	// Update room status to available
	return s.roomRepo.UpdateRoomStatus(reservation.RoomID, models.RoomStatusAvailable)
}
