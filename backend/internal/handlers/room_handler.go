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

func CreateRoomHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		var req models.CreateRoomRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.BadRequest(w, "Invalid request body")
			return
		}

		if strings.TrimSpace(req.RoomNumber) == "" {
			utils.BadRequest(w, "Room number is required")
			return
		}

		if req.Status == "" {
			req.Status = "available"
		}

		id, err := repository.CreateRoom(db, req)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Created(w, map[string]interface{}{"id": id, "message": "Room created successfully"})
	}
}

func ListRoomsHandler(db *sql.DB) http.HandlerFunc {
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

		rooms, err := repository.ListRooms(db, propertyID)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, rooms)
	}
}

func UpdateRoomHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		roomIDStr := r.URL.Query().Get("id")
		if roomIDStr == "" {
			utils.BadRequest(w, "id is required")
			return
		}

		roomID, err := strconv.ParseInt(roomIDStr, 10, 64)
		if err != nil {
			utils.BadRequest(w, "Invalid id")
			return
		}

		var req models.UpdateRoomRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.BadRequest(w, "Invalid request body")
			return
		}

		if err := repository.UpdateRoom(db, roomID, req); err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, map[string]interface{}{"message": "Room updated successfully"})
	}
}

func DeleteRoomHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		roomIDStr := r.URL.Query().Get("id")
		if roomIDStr == "" {
			utils.BadRequest(w, "id is required")
			return
		}

		roomID, err := strconv.ParseInt(roomIDStr, 10, 64)
		if err != nil {
			utils.BadRequest(w, "Invalid id")
			return
		}

		if err := repository.DeleteRoom(db, roomID); err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, map[string]interface{}{"message": "Room deleted successfully"})
	}
}
