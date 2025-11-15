package repository

import (
	"database/sql"
	"hotel-mgmt/internal/models"
)

func CreateCustomer(db *sql.DB, c models.Customer) (int64, error) {
	stmt, err := db.Prepare(`
		INSERT INTO customers (property_id, name, phone, email, address_line1, address_line2, city, state, country, postal_code, id_type, id_number, id_front_path, id_back_path)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(c.PropertyID, c.Name, c.Phone, c.Email, c.AddressLine1, c.AddressLine2, c.City, c.State, c.Country, c.PostalCode, c.IDType, c.IDNumber, c.IDFrontPath, c.IDBackPath)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func ListCustomers(db *sql.DB, propertyID int64) ([]models.Customer, error) {
	rows, err := db.Query(`
		SELECT id, property_id, name, phone, email, address_line1, address_line2, city, state, country, postal_code, id_type, id_number, id_front_path, id_back_path, created_at
		FROM customers
		WHERE property_id = ?
		ORDER BY created_at DESC
	`, propertyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	customers := []models.Customer{}

	for rows.Next() {
		var c models.Customer
		err := rows.Scan(&c.ID, &c.PropertyID, &c.Name, &c.Phone, &c.Email, &c.AddressLine1, &c.AddressLine2, &c.City, &c.State, &c.Country, &c.PostalCode, &c.IDType, &c.IDNumber, &c.IDFrontPath, &c.IDBackPath, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		customers = append(customers, c)
	}

	return customers, rows.Err()
}

func GetCustomer(db *sql.DB, customerID int64) (*models.Customer, error) {
	var c models.Customer
	err := db.QueryRow(`
		SELECT id, property_id, name, phone, email, address_line1, address_line2, city, state, country, postal_code, id_type, id_number, id_front_path, id_back_path, created_at
		FROM customers
		WHERE id = ?
	`, customerID).Scan(&c.ID, &c.PropertyID, &c.Name, &c.Phone, &c.Email, &c.AddressLine1, &c.AddressLine2, &c.City, &c.State, &c.Country, &c.PostalCode, &c.IDType, &c.IDNumber, &c.IDFrontPath, &c.IDBackPath, &c.CreatedAt)

	if err != nil {
		return nil, err
	}

	return &c, nil
}
