package main

import (
	"log"
	"net/http"
	"os"
	"ecom-app/internal/database"
	"ecom-app/internal/handlers"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	// Database configuration - use environment variables in production
	db, err := database.New(
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_USER", "postgres"),
		getEnv("DB_PASSWORD", "postgres"),
		getEnv("DB_NAME", "ecom_db"),
	)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()
	
	// Initialize handlers
	settingsHandler := handlers.NewSettingsHandler(db)
	roomTypeHandler := handlers.NewRoomTypeHandler(db)
	roomHandler := handlers.NewRoomHandler(db)
	customerHandler := handlers.NewCustomerHandler(db)
	bookingHandler := handlers.NewBookingHandler(db)
	billHandler := handlers.NewBillHandler(db)
	reportsHandler := handlers.NewReportsHandler(db)
	
	// Setup routes
	router := mux.NewRouter()
	router.HandleFunc("/api/settings", settingsHandler.GetSettings).Methods("GET")
	router.HandleFunc("/api/settings", settingsHandler.SaveSettings).Methods("POST")
	
	// Room types routes
	router.HandleFunc("/api/room-types", roomTypeHandler.GetRoomTypes).Methods("GET")
	router.HandleFunc("/api/room-types", roomTypeHandler.CreateRoomType).Methods("POST")
	router.HandleFunc("/api/room-types/{id}", roomTypeHandler.DeleteRoomType).Methods("DELETE")
	
	// Rooms routes
	router.HandleFunc("/api/rooms", roomHandler.GetRooms).Methods("GET")
	router.HandleFunc("/api/rooms", roomHandler.CreateRoom).Methods("POST")
	router.HandleFunc("/api/rooms/{id}", roomHandler.DeleteRoom).Methods("DELETE")
	
	// Customer routes
	router.HandleFunc("/api/customers", customerHandler.GetCustomers).Methods("GET")
	router.HandleFunc("/api/customers", customerHandler.CreateCustomer).Methods("POST")
	router.HandleFunc("/api/customers/{id}", customerHandler.GetCustomer).Methods("GET")
	router.HandleFunc("/api/customers/{id}/history", customerHandler.GetCustomerHistory).Methods("GET")
	
	// Booking routes
	router.HandleFunc("/api/bookings", bookingHandler.GetBookings).Methods("GET")
	router.HandleFunc("/api/bookings", bookingHandler.CreateBooking).Methods("POST")
	router.HandleFunc("/api/bookings/{id}", bookingHandler.GetBooking).Methods("GET")
	router.HandleFunc("/api/bookings/{id}", bookingHandler.UpdateBooking).Methods("PUT")
	router.HandleFunc("/api/bookings/{id}/cancel", bookingHandler.CancelBooking).Methods("PUT")
	
	// Bill routes
	router.HandleFunc("/api/bookings/{id}/generate-bill", billHandler.GenerateBill).Methods("POST")
	router.HandleFunc("/api/bookings/{id}/bill", billHandler.GetBill).Methods("GET")
	
	// Invoice counter management routes
	router.HandleFunc("/api/invoice-counters", billHandler.GetCounters).Methods("GET")
	router.HandleFunc("/api/invoice-counters/update", billHandler.UpdateCounterStartingNumber).Methods("POST")
	
	// Reports routes
	router.HandleFunc("/api/reports/rental", reportsHandler.GetRentalReport).Methods("GET")
	router.HandleFunc("/api/reports/rental/export", reportsHandler.ExportRentalReportCSV).Methods("GET")
	
	// Static file serving for uploaded photos
	router.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("uploads/"))))
	
	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"Content-Type"},
	})
	
	handler := c.Handler(router)
	
	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}