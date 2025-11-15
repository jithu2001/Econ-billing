package repository

import (
	"database/sql"
	"hotel-mgmt/internal/models"
)

func CreateBill(db *sql.DB, b models.Bill) (int64, error) {
	stmt, err := db.Prepare(`
		INSERT INTO bills (reservation_id, base_amount, gst_percentage, gst_amount, total_amount, invoice_path)
		VALUES (?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(b.ReservationID, b.BaseAmount, b.GSTPercentage, b.GSTAmount, b.TotalAmount, b.InvoicePath)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func GetBill(db *sql.DB, billID int64) (*models.Bill, error) {
	var b models.Bill
	err := db.QueryRow(`
		SELECT id, reservation_id, base_amount, gst_percentage, gst_amount, total_amount, invoice_path, generated_at
		FROM bills
		WHERE id = ?
	`, billID).Scan(&b.ID, &b.ReservationID, &b.BaseAmount, &b.GSTPercentage, &b.GSTAmount, &b.TotalAmount, &b.InvoicePath, &b.GeneratedAt)

	if err != nil {
		return nil, err
	}

	b.Items, _ = GetBillItems(db, billID)
	b.Payments, _ = GetPayments(db, billID)

	return &b, nil
}

func ListBills(db *sql.DB, reservationID int64) ([]models.Bill, error) {
	rows, err := db.Query(`
		SELECT id, reservation_id, base_amount, gst_percentage, gst_amount, total_amount, invoice_path, generated_at
		FROM bills
		WHERE reservation_id = ?
		ORDER BY generated_at DESC
	`, reservationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bills := []models.Bill{}

	for rows.Next() {
		var b models.Bill
		err := rows.Scan(&b.ID, &b.ReservationID, &b.BaseAmount, &b.GSTPercentage, &b.GSTAmount, &b.TotalAmount, &b.InvoicePath, &b.GeneratedAt)
		if err != nil {
			return nil, err
		}
		bills = append(bills, b)
	}

	return bills, rows.Err()
}

func CreateBillItem(db *sql.DB, item models.BillItem) (int64, error) {
	stmt, err := db.Prepare(`
		INSERT INTO bill_items (bill_id, description, qty, unit_price, amount)
		VALUES (?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(item.BillID, item.Description, item.Qty, item.UnitPrice, item.Amount)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func GetBillItems(db *sql.DB, billID int64) ([]models.BillItem, error) {
	rows, err := db.Query(`
		SELECT id, bill_id, description, qty, unit_price, amount
		FROM bill_items
		WHERE bill_id = ?
		ORDER BY id
	`, billID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []models.BillItem{}

	for rows.Next() {
		var item models.BillItem
		err := rows.Scan(&item.ID, &item.BillID, &item.Description, &item.Qty, &item.UnitPrice, &item.Amount)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

func GetPayments(db *sql.DB, billID int64) ([]models.Payment, error) {
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
