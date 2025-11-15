package repository

import (
	"database/sql"
	"hotel-mgmt/internal/models"
)

func CreatePayment(db *sql.DB, p models.Payment) (int64, error) {
	stmt, err := db.Prepare(`
		INSERT INTO payments (bill_id, paid_amount, method, notes)
		VALUES (?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(p.BillID, p.PaidAmount, p.Method, p.Notes)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func ListPayments(db *sql.DB, billID int64) ([]models.Payment, error) {
	rows, err := db.Query(`
		SELECT id, bill_id, paid_amount, paid_at, method, notes
		FROM payments
		WHERE bill_id = ?
		ORDER BY paid_at DESC
	`, billID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	payments := []models.Payment{}

	for rows.Next() {
		var p models.Payment
		err := rows.Scan(&p.ID, &p.BillID, &p.PaidAmount, &p.PaidAt, &p.Method, &p.Notes)
		if err != nil {
			return nil, err
		}
		payments = append(payments, p)
	}

	return payments, rows.Err()
}
