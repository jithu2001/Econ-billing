package repository

import (
	"database/sql"
	"hotel-mgmt/internal/models"
)

func CreateProperty(db *sql.DB, req models.CreatePropertyRequest, passwordHash string) (int64, error) {
	stmt, err := db.Prepare(`
		INSERT INTO properties (name, address, phone, gst_number, password_hash, default_gst)
		VALUES (?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(req.Name, req.Address, req.Phone, req.GSTNumber, passwordHash, req.DefaultGST)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func ListProperties(db *sql.DB) ([]models.PropertyResponse, error) {
	rows, err := db.Query(`
		SELECT id, name, address, phone, gst_number, default_gst, created_at
		FROM properties ORDER BY id DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	props := []models.PropertyResponse{}

	for rows.Next() {
		var p models.PropertyResponse
		err := rows.Scan(&p.ID, &p.Name, &p.Address, &p.Phone, &p.GSTNumber, &p.DefaultGST, &p.CreatedAt)
		if err != nil {
			return nil, err
		}
		props = append(props, p)
	}

	return props, rows.Err()
}
