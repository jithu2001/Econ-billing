package routes

import (
	"database/sql"
	"hotel-mgmt/internal/handlers"
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux, db *sql.DB) {
	// Property routes
	mux.HandleFunc("/api/property/create", handlers.CreatePropertyHandler(db))
	mux.HandleFunc("/api/property/list", handlers.ListPropertiesHandler(db))

	// Room routes
	mux.HandleFunc("/api/rooms/create", handlers.CreateRoomHandler(db))
	mux.HandleFunc("/api/rooms/list", handlers.ListRoomsHandler(db))
	mux.HandleFunc("/api/rooms/update", handlers.UpdateRoomHandler(db))
	mux.HandleFunc("/api/rooms/delete", handlers.DeleteRoomHandler(db))

	// Tag routes
	mux.HandleFunc("/api/tags/create", handlers.CreateTagHandler(db))
	mux.HandleFunc("/api/tags/list", handlers.ListTagsHandler(db))
	mux.HandleFunc("/api/tags/delete", handlers.DeleteTagHandler(db))

	// Customer routes
	mux.HandleFunc("/api/customers/create", handlers.CreateCustomerHandler(db))
	mux.HandleFunc("/api/customers/list", handlers.ListCustomersHandler(db))
	mux.HandleFunc("/api/customers/get", handlers.GetCustomerHandler(db))

	// Reservation routes
	mux.HandleFunc("/api/reservations/create", handlers.CreateReservationHandler(db))
	mux.HandleFunc("/api/reservations/list", handlers.ListReservationsHandler(db))
	mux.HandleFunc("/api/reservations/get", handlers.GetReservationHandler(db))

	// Booking routes
	mux.HandleFunc("/api/bookings/create", handlers.CreateBookingHandler(db))
	mux.HandleFunc("/api/bookings/list", handlers.ListBookingsHandler(db))
	mux.HandleFunc("/api/bookings/delete", handlers.DeleteBookingHandler(db))

	// Bill routes
	mux.HandleFunc("/api/bills/create", handlers.CreateBillHandler(db))
	mux.HandleFunc("/api/bills/get", handlers.GetBillHandler(db))
	mux.HandleFunc("/api/bills/list", handlers.ListBillsHandler(db))
	mux.HandleFunc("/api/bills/items/create", handlers.CreateBillItemHandler(db))

	// Payment routes
	mux.HandleFunc("/api/payments/create", handlers.CreatePaymentHandler(db))
	mux.HandleFunc("/api/payments/list", handlers.ListPaymentsHandler(db))
}
