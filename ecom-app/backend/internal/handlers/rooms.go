package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"ecom-app/internal/database"
	"ecom-app/internal/models"
	"github.com/gorilla/mux"
)

type RoomHandler struct {
	db *database.DB
}

func NewRoomHandler(db *database.DB) *RoomHandler {
	return &RoomHandler{db: db}
}

func (h *RoomHandler) GetRooms(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT r.id, r.number, r.type_id, rt.name as type_name, r.created_at 
		FROM rooms r 
		JOIN room_types rt ON r.type_id = rt.id 
		ORDER BY r.number`
	
	rows, err := h.db.Query(query)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch rooms"})
		return
	}
	defer rows.Close()
	
	var rooms []models.Room
	for rows.Next() {
		var room models.Room
		err := rows.Scan(&room.ID, &room.Number, &room.TypeID, &room.TypeName, &room.CreatedAt)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to scan room"})
			return
		}
		rooms = append(rooms, room)
	}
	
	if rooms == nil {
		rooms = []models.Room{}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rooms)
}

func (h *RoomHandler) CreateRoom(w http.ResponseWriter, r *http.Request) {
	var room models.Room
	
	if err := json.NewDecoder(r.Body).Decode(&room); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}
	
	if room.Number == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Room number is required"})
		return
	}
	
	if room.TypeID == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Room type is required"})
		return
	}
	
	// Verify room type exists
	var count int
	checkQuery := `SELECT COUNT(*) FROM room_types WHERE id = $1`
	h.db.QueryRow(checkQuery, room.TypeID).Scan(&count)
	
	if count == 0 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid room type"})
		return
	}
	
	query := `INSERT INTO rooms (number, type_id) VALUES ($1, $2) RETURNING id, created_at`
	
	err := h.db.QueryRow(query, room.Number, room.TypeID).Scan(&room.ID, &room.CreatedAt)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create room"})
		return
	}
	
	// Get room type name for response
	typeQuery := `SELECT name FROM room_types WHERE id = $1`
	h.db.QueryRow(typeQuery, room.TypeID).Scan(&room.TypeName)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(room)
}

func (h *RoomHandler) DeleteRoom(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid room ID"})
		return
	}
	
	query := `DELETE FROM rooms WHERE id = $1`
	result, err := h.db.Exec(query, id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete room"})
		return
	}
	
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Room not found"})
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}