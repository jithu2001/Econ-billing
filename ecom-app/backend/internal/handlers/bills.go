package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"ecom-app/internal/database"
	"ecom-app/internal/models"
	"github.com/gorilla/mux"
)

type BillHandler struct {
	db *database.DB
}

func NewBillHandler(db *database.DB) *BillHandler {
	return &BillHandler{db: db}
}

func (h *BillHandler) GenerateBill(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bookingID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid booking ID"})
		return
	}

	// Parse request body for GST preference
	var reqBody struct {
		IncludeGST bool `json:"include_gst"`
	}
	
	// Default to including GST if no body is provided
	reqBody.IncludeGST = true
	
	if r.Body != nil {
		json.NewDecoder(r.Body).Decode(&reqBody)
	}
	
	// Check if bill already exists for this booking
	var existingBillID int
	checkQuery := `SELECT id FROM bills WHERE booking_id = $1`
	err = h.db.QueryRow(checkQuery, bookingID).Scan(&existingBillID)
	if err == nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "Bill already exists for this booking"})
		return
	}
	
	// Get booking details
	var booking models.Booking
	bookingQuery := `
		SELECT b.id, b.customer_id, b.room_id, b.check_in, b.check_out, 
			   b.price_per_night, b.nights, b.status,
			   c.name as customer_name, c.phone as customer_phone, c.address as customer_address,
			   r.number as room_number, rt.name as room_type_name
		FROM bookings b
		JOIN customers c ON b.customer_id = c.id
		JOIN rooms r ON b.room_id = r.id
		JOIN room_types rt ON r.type_id = rt.id
		WHERE b.id = $1`
	
	err = h.db.QueryRow(bookingQuery, bookingID).Scan(
		&booking.ID,
		&booking.CustomerID,
		&booking.RoomID,
		&booking.CheckIn,
		&booking.CheckOut,
		&booking.PricePerNight,
		&booking.Nights,
		&booking.Status,
		&booking.CustomerName,
		&booking.CustomerPhone,
		&booking.CustomerAddress,
		&booking.RoomNumber,
		&booking.RoomTypeName,
	)
	
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking not found"})
		return
	}
	
	// Get business settings for GST calculation
	var businessSettings models.BusinessSettings
	settingsQuery := `SELECT property_name, property_address, gst_number, gst_percentage FROM business_settings LIMIT 1`
	err = h.db.QueryRow(settingsQuery).Scan(
		&businessSettings.PropertyName,
		&businessSettings.PropertyAddress,
		&businessSettings.GSTNumber,
		&businessSettings.GSTPercentage,
	)
	
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Business settings not configured"})
		return
	}
	
	// Calculate bill amounts based on GST preference
	subtotal := float64(booking.Nights) * booking.PricePerNight
	var gstAmount float64
	var gstPercent float64
	var totalAmount float64
	
	if reqBody.IncludeGST {
		gstPercent = businessSettings.GSTPercentage
		gstAmount = subtotal * (businessSettings.GSTPercentage / 100)
		totalAmount = subtotal + gstAmount
	} else {
		gstPercent = 0
		gstAmount = 0
		totalAmount = subtotal
	}
	
	// Generate bill number based on GST preference
	billNumber, err := h.generateBillNumber(reqBody.IncludeGST)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate bill number"})
		return
	}
	
	// Insert bill
	insertQuery := `
		INSERT INTO bills (booking_id, bill_number, subtotal, gst_included, gst_percent, gst_amount, total_amount)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at`
	
	var bill models.Bill
	bill.BookingID = bookingID
	bill.BillNumber = billNumber
	bill.Subtotal = subtotal
	bill.GSTIncluded = reqBody.IncludeGST
	bill.GSTPercent = gstPercent
	bill.GSTAmount = gstAmount
	bill.TotalAmount = totalAmount
	
	err = h.db.QueryRow(insertQuery, 
		bookingID, billNumber, subtotal, reqBody.IncludeGST, gstPercent, gstAmount, totalAmount).Scan(
		&bill.ID, &bill.CreatedAt)
	
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to generate bill"})
		return
	}
	
	// Add related data for response
	bill.BusinessName = businessSettings.PropertyName
	bill.BusinessAddress = businessSettings.PropertyAddress
	bill.BusinessGST = businessSettings.GSTNumber
	bill.CustomerName = booking.CustomerName
	bill.CustomerPhone = booking.CustomerPhone
	bill.CustomerAddress = booking.CustomerAddress
	bill.RoomNumber = booking.RoomNumber
	bill.RoomTypeName = booking.RoomTypeName
	bill.CheckIn = booking.CheckIn
	bill.CheckOut = booking.CheckOut
	bill.Nights = booking.Nights
	bill.PricePerNight = booking.PricePerNight
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(bill)
}

func (h *BillHandler) GetBill(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	bookingID, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid booking ID"})
		return
	}
	
	var bill models.Bill
	query := `
		SELECT bill.id, bill.booking_id, bill.bill_number, bill.subtotal, bill.gst_included,
			   bill.gst_percent, bill.gst_amount, bill.total_amount, bill.created_at,
			   bs.property_name, bs.property_address, bs.gst_number,
			   c.name, c.phone, c.address,
			   r.number, rt.name,
			   b.check_in, b.check_out, b.nights, b.price_per_night
		FROM bills bill
		JOIN bookings b ON bill.booking_id = b.id
		JOIN customers c ON b.customer_id = c.id
		JOIN rooms r ON b.room_id = r.id
		JOIN room_types rt ON r.type_id = rt.id
		JOIN business_settings bs ON true
		WHERE bill.booking_id = $1`
	
	err = h.db.QueryRow(query, bookingID).Scan(
		&bill.ID,
		&bill.BookingID,
		&bill.BillNumber,
		&bill.Subtotal,
		&bill.GSTIncluded,
		&bill.GSTPercent,
		&bill.GSTAmount,
		&bill.TotalAmount,
		&bill.CreatedAt,
		&bill.BusinessName,
		&bill.BusinessAddress,
		&bill.BusinessGST,
		&bill.CustomerName,
		&bill.CustomerPhone,
		&bill.CustomerAddress,
		&bill.RoomNumber,
		&bill.RoomTypeName,
		&bill.CheckIn,
		&bill.CheckOut,
		&bill.Nights,
		&bill.PricePerNight,
	)
	
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Bill not found"})
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bill)
}

// generateBillNumber generates a sequential bill number with appropriate prefix
func (h *BillHandler) generateBillNumber(isGST bool) (string, error) {
	counterType := "NON_GST"
	prefix := "TC-"
	
	if isGST {
		counterType = "GST"
		prefix = "TG-"
	}
	
	// Begin transaction for atomic counter update
	tx, err := h.db.Begin()
	if err != nil {
		return "", err
	}
	defer tx.Rollback()
	
	// Get and increment the counter
	var currentNumber int
	updateQuery := `
		UPDATE invoice_counters 
		SET current_number = current_number + 1, updated_at = CURRENT_TIMESTAMP
		WHERE counter_type = $1
		RETURNING current_number`
	
	err = tx.QueryRow(updateQuery, counterType).Scan(&currentNumber)
	if err != nil {
		return "", err
	}
	
	// Commit the transaction
	if err = tx.Commit(); err != nil {
		return "", err
	}
	
	// Generate the bill number with zero-padding
	billNumber := fmt.Sprintf("%s%06d", prefix, currentNumber)
	return billNumber, nil
}

// UpdateCounterStartingNumber allows setting custom starting numbers for existing businesses
func (h *BillHandler) UpdateCounterStartingNumber(w http.ResponseWriter, r *http.Request) {
	var reqBody struct {
		CounterType   string `json:"counter_type"`   // "GST" or "NON_GST"
		StartingNumber int   `json:"starting_number"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}
	
	// Validate counter type
	if reqBody.CounterType != "GST" && reqBody.CounterType != "NON_GST" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Counter type must be 'GST' or 'NON_GST'"})
		return
	}
	
	// Validate starting number
	if reqBody.StartingNumber < 1 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Starting number must be at least 1"})
		return
	}
	
	// Update the counter (subtract 1 because generateBillNumber will increment it)
	updateQuery := `
		UPDATE invoice_counters 
		SET current_number = $1 - 1, updated_at = CURRENT_TIMESTAMP
		WHERE counter_type = $2`
	
	_, err := h.db.Exec(updateQuery, reqBody.StartingNumber, reqBody.CounterType)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update counter"})
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": fmt.Sprintf("%s counter updated to start from %d", reqBody.CounterType, reqBody.StartingNumber),
	})
}

// GetCounters returns the current counter values
func (h *BillHandler) GetCounters(w http.ResponseWriter, r *http.Request) {
	query := `SELECT counter_type, current_number FROM invoice_counters ORDER BY counter_type`
	
	rows, err := h.db.Query(query)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch counters"})
		return
	}
	defer rows.Close()
	
	var counters []models.InvoiceCounter
	for rows.Next() {
		var counter models.InvoiceCounter
		err := rows.Scan(&counter.CounterType, &counter.CurrentNumber)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to scan counter data"})
			return
		}
		counters = append(counters, counter)
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(counters)
}