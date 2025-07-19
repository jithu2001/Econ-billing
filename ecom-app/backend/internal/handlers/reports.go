package handlers

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
	"ecom-app/internal/database"
)

type ReportsHandler struct {
	db *database.DB
}

func NewReportsHandler(db *database.DB) *ReportsHandler {
	return &ReportsHandler{db: db}
}

type RentalReportFilter struct {
	DateFrom     string `json:"date_from"`     // YYYY-MM-DD
	DateTo       string `json:"date_to"`       // YYYY-MM-DD
	DateType     string `json:"date_type"`     // 'check_in', 'check_out', 'booking_date', 'bill_date'
	CustomerName string `json:"customer_name"` // Filter by customer name
	RoomType     string `json:"room_type"`     // Filter by room type
	RoomNumber   string `json:"room_number"`   // Filter by room number
	Status       string `json:"status"`        // Filter by booking status
	GSTFilter    string `json:"gst_filter"`    // 'all', 'gst_only', 'non_gst_only'
	MinAmount    string `json:"min_amount"`    // Minimum total amount
	MaxAmount    string `json:"max_amount"`    // Maximum total amount
}

type RentalReportItem struct {
	BookingID       int     `json:"booking_id"`
	BillNumber      string  `json:"bill_number"`
	BookingDate     string  `json:"booking_date"`
	CheckIn         string  `json:"check_in"`
	CheckOut        string  `json:"check_out"`
	Nights          int     `json:"nights"`
	CustomerName    string  `json:"customer_name"`
	CustomerPhone   string  `json:"customer_phone"`
	RoomNumber      string  `json:"room_number"`
	RoomType        string  `json:"room_type"`
	PricePerNight   float64 `json:"price_per_night"`
	Subtotal        float64 `json:"subtotal"`
	GSTIncluded     bool    `json:"gst_included"`
	GSTPercent      float64 `json:"gst_percent"`
	GSTAmount       float64 `json:"gst_amount"`
	TotalAmount     float64 `json:"total_amount"`
	Status          string  `json:"status"`
	BillDate        string  `json:"bill_date"`
}

type RentalReportSummary struct {
	TotalBookings    int     `json:"total_bookings"`
	TotalRevenue     float64 `json:"total_revenue"`
	TotalGSTAmount   float64 `json:"total_gst_amount"`
	TotalNonGST      float64 `json:"total_non_gst"`
	TotalGSTRevenue  float64 `json:"total_gst_revenue"`
	AverageStayNights float64 `json:"average_stay_nights"`
	UniqueCustomers  int     `json:"unique_customers"`
}

type RentalReportResponse struct {
	Items   []RentalReportItem  `json:"items"`
	Summary RentalReportSummary `json:"summary"`
	Filters RentalReportFilter  `json:"filters"`
}

func (h *ReportsHandler) GetRentalReport(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	filters := RentalReportFilter{
		DateFrom:     r.URL.Query().Get("date_from"),
		DateTo:       r.URL.Query().Get("date_to"),
		DateType:     r.URL.Query().Get("date_type"),
		CustomerName: r.URL.Query().Get("customer_name"),
		RoomType:     r.URL.Query().Get("room_type"),
		RoomNumber:   r.URL.Query().Get("room_number"),
		Status:       r.URL.Query().Get("status"),
		GSTFilter:    r.URL.Query().Get("gst_filter"),
		MinAmount:    r.URL.Query().Get("min_amount"),
		MaxAmount:    r.URL.Query().Get("max_amount"),
	}

	// Set defaults
	if filters.DateType == "" {
		filters.DateType = "check_in"
	}
	if filters.GSTFilter == "" {
		filters.GSTFilter = "all"
	}

	// Build query
	query, args := h.buildRentalReportQuery(filters)

	// Execute query
	rows, err := h.db.Query(query, args...)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch rental report"})
		return
	}
	defer rows.Close()

	var items []RentalReportItem
	var totalRevenue, totalGSTAmount, totalNonGST, totalGSTRevenue float64
	var totalNights int
	uniqueCustomers := make(map[string]bool)

	for rows.Next() {
		var item RentalReportItem
		var billDate *time.Time
		
		err := rows.Scan(
			&item.BookingID,
			&item.BillNumber,
			&item.BookingDate,
			&item.CheckIn,
			&item.CheckOut,
			&item.Nights,
			&item.CustomerName,
			&item.CustomerPhone,
			&item.RoomNumber,
			&item.RoomType,
			&item.PricePerNight,
			&item.Subtotal,
			&item.GSTIncluded,
			&item.GSTPercent,
			&item.GSTAmount,
			&item.TotalAmount,
			&item.Status,
			&billDate,
		)
		
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to scan rental report data"})
			return
		}

		// Format bill date
		if billDate != nil {
			item.BillDate = billDate.Format("2006-01-02")
		}

		items = append(items, item)

		// Calculate summary
		totalRevenue += item.TotalAmount
		if item.GSTIncluded {
			totalGSTAmount += item.GSTAmount
			totalGSTRevenue += item.TotalAmount
		} else {
			totalNonGST += item.TotalAmount
		}
		totalNights += item.Nights
		uniqueCustomers[item.CustomerName] = true
	}

	// Calculate averages
	var averageStayNights float64
	if len(items) > 0 {
		averageStayNights = float64(totalNights) / float64(len(items))
	}

	summary := RentalReportSummary{
		TotalBookings:     len(items),
		TotalRevenue:      totalRevenue,
		TotalGSTAmount:    totalGSTAmount,
		TotalNonGST:       totalNonGST,
		TotalGSTRevenue:   totalGSTRevenue,
		AverageStayNights: averageStayNights,
		UniqueCustomers:   len(uniqueCustomers),
	}

	response := RentalReportResponse{
		Items:   items,
		Summary: summary,
		Filters: filters,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *ReportsHandler) buildRentalReportQuery(filters RentalReportFilter) (string, []interface{}) {
	baseQuery := `
		SELECT 
			b.id as booking_id,
			COALESCE(bill.bill_number, '') as bill_number,
			b.created_at::date as booking_date,
			b.check_in,
			b.check_out,
			b.nights,
			c.name as customer_name,
			c.phone as customer_phone,
			r.number as room_number,
			rt.name as room_type,
			b.price_per_night,
			COALESCE(bill.subtotal, b.total_amount) as subtotal,
			COALESCE(bill.gst_included, false) as gst_included,
			COALESCE(bill.gst_percent, 0) as gst_percent,
			COALESCE(bill.gst_amount, 0) as gst_amount,
			COALESCE(bill.total_amount, b.total_amount) as total_amount,
			b.status,
			bill.created_at as bill_date
		FROM bookings b
		JOIN customers c ON b.customer_id = c.id
		JOIN rooms r ON b.room_id = r.id
		JOIN room_types rt ON r.type_id = rt.id
		LEFT JOIN bills bill ON b.id = bill.booking_id
		WHERE 1=1`

	var conditions []string
	var args []interface{}
	argIndex := 1

	// Date filtering
	if filters.DateFrom != "" {
		var dateField string
		switch filters.DateType {
		case "check_out":
			dateField = "b.check_out"
		case "booking_date":
			dateField = "b.created_at::date"
		case "bill_date":
			dateField = "bill.created_at::date"
		default:
			dateField = "b.check_in"
		}
		conditions = append(conditions, fmt.Sprintf("%s >= $%d", dateField, argIndex))
		args = append(args, filters.DateFrom)
		argIndex++
	}

	if filters.DateTo != "" {
		var dateField string
		switch filters.DateType {
		case "check_out":
			dateField = "b.check_out"
		case "booking_date":
			dateField = "b.created_at::date"
		case "bill_date":
			dateField = "bill.created_at::date"
		default:
			dateField = "b.check_in"
		}
		conditions = append(conditions, fmt.Sprintf("%s <= $%d", dateField, argIndex))
		args = append(args, filters.DateTo)
		argIndex++
	}

	// Customer name filtering
	if filters.CustomerName != "" {
		conditions = append(conditions, fmt.Sprintf("c.name ILIKE $%d", argIndex))
		args = append(args, "%"+filters.CustomerName+"%")
		argIndex++
	}

	// Room type filtering
	if filters.RoomType != "" {
		conditions = append(conditions, fmt.Sprintf("rt.name ILIKE $%d", argIndex))
		args = append(args, "%"+filters.RoomType+"%")
		argIndex++
	}

	// Room number filtering
	if filters.RoomNumber != "" {
		conditions = append(conditions, fmt.Sprintf("r.number ILIKE $%d", argIndex))
		args = append(args, "%"+filters.RoomNumber+"%")
		argIndex++
	}

	// Status filtering
	if filters.Status != "" {
		conditions = append(conditions, fmt.Sprintf("b.status = $%d", argIndex))
		args = append(args, filters.Status)
		argIndex++
	}

	// GST filtering
	switch filters.GSTFilter {
	case "gst_only":
		conditions = append(conditions, "bill.gst_included = true")
	case "non_gst_only":
		conditions = append(conditions, "(bill.gst_included = false OR bill.gst_included IS NULL)")
	}

	// Amount filtering
	if filters.MinAmount != "" {
		if minAmt, err := strconv.ParseFloat(filters.MinAmount, 64); err == nil {
			conditions = append(conditions, fmt.Sprintf("COALESCE(bill.total_amount, b.total_amount) >= $%d", argIndex))
			args = append(args, minAmt)
			argIndex++
		}
	}

	if filters.MaxAmount != "" {
		if maxAmt, err := strconv.ParseFloat(filters.MaxAmount, 64); err == nil {
			conditions = append(conditions, fmt.Sprintf("COALESCE(bill.total_amount, b.total_amount) <= $%d", argIndex))
			args = append(args, maxAmt)
			argIndex++
		}
	}

	// Combine conditions
	if len(conditions) > 0 {
		baseQuery += " AND " + strings.Join(conditions, " AND ")
	}

	// Order by date
	baseQuery += " ORDER BY b.check_in DESC, b.created_at DESC"

	return baseQuery, args
}

func (h *ReportsHandler) ExportRentalReportCSV(w http.ResponseWriter, r *http.Request) {
	// Parse filters (same as GetRentalReport)
	filters := RentalReportFilter{
		DateFrom:     r.URL.Query().Get("date_from"),
		DateTo:       r.URL.Query().Get("date_to"),
		DateType:     r.URL.Query().Get("date_type"),
		CustomerName: r.URL.Query().Get("customer_name"),
		RoomType:     r.URL.Query().Get("room_type"),
		RoomNumber:   r.URL.Query().Get("room_number"),
		Status:       r.URL.Query().Get("status"),
		GSTFilter:    r.URL.Query().Get("gst_filter"),
		MinAmount:    r.URL.Query().Get("min_amount"),
		MaxAmount:    r.URL.Query().Get("max_amount"),
	}

	if filters.DateType == "" {
		filters.DateType = "check_in"
	}
	if filters.GSTFilter == "" {
		filters.GSTFilter = "all"
	}

	// Build and execute query
	query, args := h.buildRentalReportQuery(filters)
	rows, err := h.db.Query(query, args...)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch rental report"})
		return
	}
	defer rows.Close()

	// Set CSV headers
	filename := fmt.Sprintf("rental_report_%s.csv", time.Now().Format("2006-01-02"))
	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filename))

	writer := csv.NewWriter(w)
	defer writer.Flush()

	// Write CSV header
	headers := []string{
		"Booking ID", "Bill Number", "Booking Date", "Check In", "Check Out", "Nights",
		"Customer Name", "Customer Phone", "Room Number", "Room Type", "Price Per Night",
		"Subtotal", "GST Included", "GST %", "GST Amount", "Total Amount", "Status", "Bill Date",
	}
	writer.Write(headers)

	// Write data rows
	for rows.Next() {
		var item RentalReportItem
		var billDate *time.Time
		
		err := rows.Scan(
			&item.BookingID, &item.BillNumber, &item.BookingDate, &item.CheckIn, &item.CheckOut,
			&item.Nights, &item.CustomerName, &item.CustomerPhone, &item.RoomNumber, &item.RoomType,
			&item.PricePerNight, &item.Subtotal, &item.GSTIncluded, &item.GSTPercent, &item.GSTAmount,
			&item.TotalAmount, &item.Status, &billDate,
		)
		
		if err != nil {
			continue
		}

		if billDate != nil {
			item.BillDate = billDate.Format("2006-01-02")
		}

		gstIncludedStr := "No"
		if item.GSTIncluded {
			gstIncludedStr = "Yes"
		}

		record := []string{
			strconv.Itoa(item.BookingID),
			item.BillNumber,
			item.BookingDate,
			item.CheckIn,
			item.CheckOut,
			strconv.Itoa(item.Nights),
			item.CustomerName,
			item.CustomerPhone,
			item.RoomNumber,
			item.RoomType,
			fmt.Sprintf("%.2f", item.PricePerNight),
			fmt.Sprintf("%.2f", item.Subtotal),
			gstIncludedStr,
			fmt.Sprintf("%.2f", item.GSTPercent),
			fmt.Sprintf("%.2f", item.GSTAmount),
			fmt.Sprintf("%.2f", item.TotalAmount),
			item.Status,
			item.BillDate,
		}
		writer.Write(record)
	}
}