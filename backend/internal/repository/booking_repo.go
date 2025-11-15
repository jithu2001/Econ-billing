package repository

import (
	"database/sql"
	"hotel-mgmt/internal/models"
)

func CreateBooking(db *sql.DB, b models.Booking) (int64, error) {
	stmt, err := db.Prepare(`
		INSERT INTO bookings (reservation_id, room_id, status)
		VALUES (?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(b.ReservationID, b.RoomID, b.Status)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func ListBookings(db *sql.DB, reservationID int64) ([]models.Booking, error) {
	rows, err := db.Query(`
		SELECT id, reservation_id, room_id, status, created_at
		FROM bookings
		WHERE reservation_id = ?
		ORDER BY created_at
	`, reservationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bookings := []models.Booking{}

	for rows.Next() {
		var b models.Booking
		err := rows.Scan(&b.ID, &b.ReservationID, &b.RoomID, &b.Status, &b.CreatedAt)
		if err != nil {
			return nil, err
		}
		bookings = append(bookings, b)
	}

	return bookings, rows.Err()
}

func DeleteBooking(db *sql.DB, bookingID int64) error {
	_, err := db.Exec("DELETE FROM bookings WHERE id = ?", bookingID)
	return err
}
