package handlers

import (
	"database/sql"
	"encoding/json"
	"hotel-mgmt/internal/models"
	"hotel-mgmt/internal/repository"
	"hotel-mgmt/internal/utils"
	"net/http"
	"strconv"
)

func CreateBookingHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		var b models.Booking
		if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
			utils.BadRequest(w, "Invalid request body")
			return
		}

		if b.Status == "" {
			b.Status = "confirmed"
		}

		id, err := repository.CreateBooking(db, b)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Created(w, map[string]interface{}{"id": id, "message": "Booking created successfully"})
	}
}

func ListBookingsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		reservationIDStr := r.URL.Query().Get("reservation_id")
		if reservationIDStr == "" {
			utils.BadRequest(w, "reservation_id is required")
			return
		}

		reservationID, err := strconv.ParseInt(reservationIDStr, 10, 64)
		if err != nil {
			utils.BadRequest(w, "Invalid reservation_id")
			return
		}

		bookings, err := repository.ListBookings(db, reservationID)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, bookings)
	}
}

func DeleteBookingHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		bookingIDStr := r.URL.Query().Get("id")
		if bookingIDStr == "" {
			utils.BadRequest(w, "id is required")
			return
		}

		bookingID, err := strconv.ParseInt(bookingIDStr, 10, 64)
		if err != nil {
			utils.BadRequest(w, "Invalid id")
			return
		}

		if err := repository.DeleteBooking(db, bookingID); err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, map[string]interface{}{"message": "Booking deleted successfully"})
	}
}
