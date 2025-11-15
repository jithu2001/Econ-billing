package repository

import (
	"database/sql"
	"hotel-mgmt/internal/models"
)

func CreateReservation(db *sql.DB, r models.Reservation) (int64, error) {
	stmt, err := db.Prepare(`
		INSERT INTO reservations (property_id, customer_id, platform, checkin_date, checkout_date, status, notes)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(r.PropertyID, r.CustomerID, r.Platform, r.CheckInDate, r.CheckOutDate, r.Status, r.Notes)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func ListReservations(db *sql.DB, propertyID int64) ([]models.Reservation, error) {
	rows, err := db.Query(`
		SELECT id, property_id, customer_id, platform, checkin_date, checkout_date, status, notes, created_at
		FROM reservations
		WHERE property_id = ?
		ORDER BY created_at DESC
	`, propertyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	reservations := []models.Reservation{}

	for rows.Next() {
		var r models.Reservation
		err := rows.Scan(&r.ID, &r.PropertyID, &r.CustomerID, &r.Platform, &r.CheckInDate, &r.CheckOutDate, &r.Status, &r.Notes, &r.CreatedAt)
		if err != nil {
			return nil, err
		}
		reservations = append(reservations, r)
	}

	return reservations, rows.Err()
}

func GetReservation(db *sql.DB, reservationID int64) (*models.Reservation, error) {
	var r models.Reservation
	err := db.QueryRow(`
		SELECT id, property_id, customer_id, platform, checkin_date, checkout_date, status, notes, created_at
		FROM reservations
		WHERE id = ?
	`, reservationID).Scan(&r.ID, &r.PropertyID, &r.CustomerID, &r.Platform, &r.CheckInDate, &r.CheckOutDate, &r.Status, &r.Notes, &r.CreatedAt)

	if err != nil {
		return nil, err
	}

	return &r, nil
}
