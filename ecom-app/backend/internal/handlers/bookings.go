package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"
	"ecom-app/internal/database"
	"ecom-app/internal/models"
	"github.com/gorilla/mux"
)

type BookingHandler struct {
	db *database.DB
}

func NewBookingHandler(db *database.DB) *BookingHandler {
	return &BookingHandler{db: db}
}

func (h *BookingHandler) GetBookings(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT b.id, b.customer_id, b.room_id, b.check_in, b.check_out, 
			   b.price_per_night, b.total_amount, b.nights, b.status, b.created_at,
			   c.name as customer_name, c.phone as customer_phone,
			   r.number as room_number, rt.name as room_type_name
		FROM bookings b
		JOIN customers c ON b.customer_id = c.id
		JOIN rooms r ON b.room_id = r.id
		JOIN room_types rt ON r.type_id = rt.id
		ORDER BY b.created_at DESC`
	
	rows, err := h.db.Query(query)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch bookings"})
		return
	}
	defer rows.Close()
	
	var bookings []models.Booking
	for rows.Next() {
		var booking models.Booking
		err := rows.Scan(
			&booking.ID,
			&booking.CustomerID,
			&booking.RoomID,
			&booking.CheckIn,
			&booking.CheckOut,
			&booking.PricePerNight,
			&booking.TotalAmount,
			&booking.Nights,
			&booking.Status,
			&booking.CreatedAt,
			&booking.CustomerName,
			&booking.CustomerPhone,
			&booking.RoomNumber,
			&booking.RoomTypeName,
		)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to scan booking"})
			return
		}
		bookings = append(bookings, booking)
	}
	
	if bookings == nil {
		bookings = []models.Booking{}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookings)
}

func (h *BookingHandler) GetBooking(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid booking ID"})
		return
	}
	
	var booking models.Booking
	query := `
		SELECT b.id, b.customer_id, b.room_id, b.check_in, b.check_out, 
			   b.price_per_night, b.total_amount, b.nights, b.status, b.created_at,
			   c.name as customer_name, c.phone as customer_phone,
			   r.number as room_number, rt.name as room_type_name
		FROM bookings b
		JOIN customers c ON b.customer_id = c.id
		JOIN rooms r ON b.room_id = r.id
		JOIN room_types rt ON r.type_id = rt.id
		WHERE b.id = $1`
	
	err = h.db.QueryRow(query, id).Scan(
		&booking.ID,
		&booking.CustomerID,
		&booking.RoomID,
		&booking.CheckIn,
		&booking.CheckOut,
		&booking.PricePerNight,
		&booking.TotalAmount,
		&booking.Nights,
		&booking.Status,
		&booking.CreatedAt,
		&booking.CustomerName,
		&booking.CustomerPhone,
		&booking.RoomNumber,
		&booking.RoomTypeName,
	)
	
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking not found"})
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(booking)
}

func (h *BookingHandler) CreateBooking(w http.ResponseWriter, r *http.Request) {
	var req models.BookingRequest
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}
	
	// Validate required fields
	if req.CustomerID == 0 || req.RoomID == 0 || req.CheckIn == "" || req.CheckOut == "" || req.PricePerNight <= 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "All fields are required and price must be positive"})
		return
	}
	
	// Parse dates
	checkIn, err := time.Parse("2006-01-02", req.CheckIn)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid check-in date format. Use YYYY-MM-DD"})
		return
	}
	
	checkOut, err := time.Parse("2006-01-02", req.CheckOut)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid check-out date format. Use YYYY-MM-DD"})
		return
	}
	
	// Validate dates
	if checkOut.Before(checkIn) || checkOut.Equal(checkIn) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Check-out date must be after check-in date"})
		return
	}
	
	// Check if dates are not in the past
	today := time.Now().Truncate(24 * time.Hour)
	if checkIn.Before(today) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Check-in date cannot be in the past"})
		return
	}
	
	// Calculate nights
	nights := int(checkOut.Sub(checkIn).Hours() / 24)
	totalAmount := float64(nights) * req.PricePerNight
	
	// Verify customer exists
	var customerCount int
	h.db.QueryRow("SELECT COUNT(*) FROM customers WHERE id = $1", req.CustomerID).Scan(&customerCount)
	if customerCount == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Customer not found"})
		return
	}
	
	// Verify room exists
	var roomCount int
	h.db.QueryRow("SELECT COUNT(*) FROM rooms WHERE id = $1", req.RoomID).Scan(&roomCount)
	if roomCount == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Room not found"})
		return
	}
	
	// Check for overlapping bookings
	overlapQuery := `
		SELECT COUNT(*) FROM bookings 
		WHERE room_id = $1 
		AND status NOT IN ('cancelled', 'checked_out')
		AND (
			(check_in <= $2 AND check_out > $2) OR
			(check_in < $3 AND check_out >= $3) OR
			(check_in >= $2 AND check_out <= $3)
		)`
	
	var overlapCount int
	err = h.db.QueryRow(overlapQuery, req.RoomID, checkIn, checkOut).Scan(&overlapCount)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to check room availability"})
		return
	}
	
	if overlapCount > 0 {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "Room is not available for the selected dates"})
		return
	}
	
	// Insert booking
	insertQuery := `
		INSERT INTO bookings (customer_id, room_id, check_in, check_out, price_per_night, total_amount, nights)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at`
	
	var booking models.Booking
	booking.CustomerID = req.CustomerID
	booking.RoomID = req.RoomID
	booking.CheckIn = checkIn
	booking.CheckOut = checkOut
	booking.PricePerNight = req.PricePerNight
	booking.TotalAmount = totalAmount
	booking.Nights = nights
	booking.Status = "confirmed"
	
	err = h.db.QueryRow(insertQuery, 
		req.CustomerID, req.RoomID, checkIn, checkOut, 
		req.PricePerNight, totalAmount, nights).Scan(&booking.ID, &booking.CreatedAt)
	
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create booking"})
		return
	}
	
	// Get related data for response
	detailQuery := `
		SELECT c.name, c.phone, r.number, rt.name
		FROM customers c, rooms r, room_types rt
		WHERE c.id = $1 AND r.id = $2 AND r.type_id = rt.id`
	
	h.db.QueryRow(detailQuery, req.CustomerID, req.RoomID).Scan(
		&booking.CustomerName, &booking.CustomerPhone, 
		&booking.RoomNumber, &booking.RoomTypeName)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(booking)
}

func (h *BookingHandler) CancelBooking(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid booking ID"})
		return
	}
	
	// Check if booking exists and get its current status
	var currentStatus string
	checkQuery := `SELECT status FROM bookings WHERE id = $1`
	err = h.db.QueryRow(checkQuery, id).Scan(&currentStatus)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking not found"})
		return
	}
	
	// Check if booking can be cancelled
	if currentStatus == "cancelled" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking is already cancelled"})
		return
	}
	
	if currentStatus == "checked_out" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Cannot cancel a completed booking"})
		return
	}
	
	// Update booking status to cancelled
	updateQuery := `UPDATE bookings SET status = 'cancelled' WHERE id = $1`
	result, err := h.db.Exec(updateQuery, id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to cancel booking"})
		return
	}
	
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking not found"})
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Booking cancelled successfully"})
}

func (h *BookingHandler) UpdateBooking(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid booking ID"})
		return
	}
	
	var updateRequest struct {
		Status string `json:"status"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&updateRequest); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}
	
	// Validate status
	validStatuses := map[string]bool{
		"confirmed":    true,
		"checked_in":   true,
		"checked_out":  true,
		"cancelled":    true,
	}
	
	if !validStatuses[updateRequest.Status] {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid status"})
		return
	}
	
	// Update booking status
	updateQuery := `UPDATE bookings SET status = $1 WHERE id = $2`
	result, err := h.db.Exec(updateQuery, updateRequest.Status, id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update booking"})
		return
	}
	
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Booking not found"})
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Booking updated successfully"})
}