package handlers

import (
	"database/sql"
	"encoding/json"
	"hotel-mgmt/internal/models"
	"hotel-mgmt/internal/repository"
	"hotel-mgmt/internal/utils"
	"net/http"
	"strconv"
	"strings"
)

func CreateReservationHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		var res models.Reservation
		if err := json.NewDecoder(r.Body).Decode(&res); err != nil {
			utils.BadRequest(w, "Invalid request body")
			return
		}

		if strings.TrimSpace(res.CheckInDate) == "" {
			utils.BadRequest(w, "Check-in date is required")
			return
		}

		if strings.TrimSpace(res.CheckOutDate) == "" {
			utils.BadRequest(w, "Check-out date is required")
			return
		}

		if res.Status == "" {
			res.Status = "pending"
		}

		id, err := repository.CreateReservation(db, res)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Created(w, map[string]interface{}{"id": id, "message": "Reservation created successfully"})
	}
}

func ListReservationsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		propertyIDStr := r.URL.Query().Get("property_id")
		if propertyIDStr == "" {
			utils.BadRequest(w, "property_id is required")
			return
		}

		propertyID, err := strconv.ParseInt(propertyIDStr, 10, 64)
		if err != nil {
			utils.BadRequest(w, "Invalid property_id")
			return
		}

		reservations, err := repository.ListReservations(db, propertyID)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, reservations)
	}
}

func GetReservationHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		reservationIDStr := r.URL.Query().Get("id")
		if reservationIDStr == "" {
			utils.BadRequest(w, "id is required")
			return
		}

		reservationID, err := strconv.ParseInt(reservationIDStr, 10, 64)
		if err != nil {
			utils.BadRequest(w, "Invalid id")
			return
		}

		reservation, err := repository.GetReservation(db, reservationID)
		if err != nil {
			if err == sql.ErrNoRows {
				utils.NotFound(w, "Reservation not found")
				return
			}
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, reservation)
	}
}
