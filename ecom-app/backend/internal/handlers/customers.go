package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"ecom-app/internal/config"
	"ecom-app/internal/database"
	"ecom-app/internal/models"
	"ecom-app/pkg/utils"
	"github.com/gorilla/mux"
)

type CustomerHandler struct {
	db *database.DB
}

func NewCustomerHandler(db *database.DB) *CustomerHandler {
	return &CustomerHandler{db: db}
}

func (h *CustomerHandler) GetCustomers(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	
	var query string
	var args []interface{}
	
	if search != "" {
		query = `SELECT id, name, address, phone, id_card_photo, created_at 
				 FROM customers 
				 WHERE name ILIKE $1 OR phone ILIKE $1 
				 ORDER BY created_at DESC`
		args = append(args, "%"+search+"%")
	} else {
		query = `SELECT id, name, address, phone, id_card_photo, created_at 
				 FROM customers 
				 ORDER BY created_at DESC`
	}
	
	rows, err := h.db.Query(query, args...)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch customers"})
		return
	}
	defer rows.Close()
	
	var customers []models.Customer
	for rows.Next() {
		var customer models.Customer
		err := rows.Scan(
			&customer.ID,
			&customer.Name,
			&customer.Address,
			&customer.Phone,
			&customer.IDCardPhoto,
			&customer.CreatedAt,
		)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to scan customer"})
			return
		}
		customers = append(customers, customer)
	}
	
	if customers == nil {
		customers = []models.Customer{}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(customers)
}

func (h *CustomerHandler) GetCustomer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid customer ID"})
		return
	}
	
	var customer models.Customer
	query := `SELECT id, name, address, phone, id_card_photo, created_at 
			  FROM customers WHERE id = $1`
	
	err = h.db.QueryRow(query, id).Scan(
		&customer.ID,
		&customer.Name,
		&customer.Address,
		&customer.Phone,
		&customer.IDCardPhoto,
		&customer.CreatedAt,
	)
	
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Customer not found"})
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(customer)
}

func (h *CustomerHandler) CreateCustomer(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to parse form"})
		return
	}
	
	// Get form values
	name := strings.TrimSpace(r.FormValue("name"))
	address := strings.TrimSpace(r.FormValue("address"))
	phone := strings.TrimSpace(r.FormValue("phone"))
	
	// Validate required fields
	if name == "" || address == "" || phone == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Name, address, and phone are required"})
		return
	}
	
	var photoPath string
	
	// Handle file upload if present
	file, header, err := r.FormFile("id_card_photo")
	if err == nil {
		defer file.Close()
		
		// Save the uploaded file
		filename, err := utils.SaveUploadedFile(file, header, config.GetIDCardsDir())
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}
		photoPath = filename
	}
	
	// Insert customer into database
	query := `INSERT INTO customers (name, address, phone, id_card_photo) 
			  VALUES ($1, $2, $3, $4) 
			  RETURNING id, created_at`
	
	var customer models.Customer
	customer.Name = name
	customer.Address = address
	customer.Phone = phone
	customer.IDCardPhoto = photoPath
	
	err = h.db.QueryRow(query, name, address, phone, photoPath).Scan(
		&customer.ID,
		&customer.CreatedAt,
	)
	
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create customer"})
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(customer)
}

func (h *CustomerHandler) GetCustomerHistory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid customer ID"})
		return
	}

	// Get customer details
	var customer models.Customer
	query := `SELECT id, name, address, phone, id_card_photo, created_at 
			  FROM customers WHERE id = $1`
	err = h.db.QueryRow(query, id).Scan(
		&customer.ID, &customer.Name, &customer.Address, &customer.Phone, 
		&customer.IDCardPhoto, &customer.CreatedAt)
	
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Customer not found"})
		return
	}

	// Get customer's bookings with bill information
	bookingsQuery := `
		SELECT 
			b.id, b.room_id, b.check_in, b.check_out, 
			b.price_per_night, b.total_amount, b.nights, b.status, b.created_at,
			r.number as room_number, rt.name as room_type_name,
			COALESCE(bill.id, 0) as bill_id,
			COALESCE(bill.bill_number, '') as bill_number,
			COALESCE(bill.total_amount, 0) as bill_total
		FROM bookings b
		JOIN rooms r ON b.room_id = r.id
		JOIN room_types rt ON r.type_id = rt.id
		LEFT JOIN bills bill ON bill.booking_id = b.id
		WHERE b.customer_id = $1
		ORDER BY b.created_at DESC`

	rows, err := h.db.Query(bookingsQuery, id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch bookings"})
		return
	}
	defer rows.Close()

	bookings := []map[string]interface{}{}
	for rows.Next() {
		var booking models.Booking
		var billID int
		var billNumber string
		var billTotal float64

		err := rows.Scan(
			&booking.ID,
			&booking.RoomID,
			&booking.CheckIn,
			&booking.CheckOut,
			&booking.PricePerNight,
			&booking.TotalAmount,
			&booking.Nights,
			&booking.Status,
			&booking.CreatedAt,
			&booking.RoomNumber,
			&booking.RoomTypeName,
			&billID,
			&billNumber,
			&billTotal,
		)
		if err != nil {
			continue
		}

		bookingMap := map[string]interface{}{
			"id":              booking.ID,
			"room_id":         booking.RoomID,
			"check_in":        booking.CheckIn,
			"check_out":       booking.CheckOut,
			"price_per_night": booking.PricePerNight,
			"total_amount":    booking.TotalAmount,
			"nights":          booking.Nights,
			"status":          booking.Status,
			"created_at":      booking.CreatedAt,
			"room_number":     booking.RoomNumber,
			"room_type_name":  booking.RoomTypeName,
			"has_bill":        billID > 0,
			"bill_id":         billID,
			"bill_number":     billNumber,
		}
		bookings = append(bookings, bookingMap)
	}

	// Calculate statistics
	var totalBookings int
	var totalSpent float64
	var totalNights int

	statsQuery := `
		SELECT 
			COUNT(*) as total_bookings,
			COALESCE(SUM(total_amount), 0) as total_spent,
			COALESCE(SUM(nights), 0) as total_nights
		FROM bookings 
		WHERE customer_id = $1 AND status != 'cancelled'`
	
	h.db.QueryRow(statsQuery, id).Scan(&totalBookings, &totalSpent, &totalNights)

	// Prepare response
	response := map[string]interface{}{
		"customer": customer,
		"statistics": map[string]interface{}{
			"total_bookings": totalBookings,
			"total_spent":    totalSpent,
			"total_nights":   totalNights,
		},
		"bookings": bookings,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}