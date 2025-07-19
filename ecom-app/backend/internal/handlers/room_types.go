package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"ecom-app/internal/database"
	"ecom-app/internal/models"
	"github.com/gorilla/mux"
)

type RoomTypeHandler struct {
	db *database.DB
}

func NewRoomTypeHandler(db *database.DB) *RoomTypeHandler {
	return &RoomTypeHandler{db: db}
}

func (h *RoomTypeHandler) GetRoomTypes(w http.ResponseWriter, r *http.Request) {
	query := `SELECT id, name, created_at FROM room_types ORDER BY name`
	
	rows, err := h.db.Query(query)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch room types"})
		return
	}
	defer rows.Close()
	
	var roomTypes []models.RoomType
	for rows.Next() {
		var rt models.RoomType
		err := rows.Scan(&rt.ID, &rt.Name, &rt.CreatedAt)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to scan room type"})
			return
		}
		roomTypes = append(roomTypes, rt)
	}
	
	if roomTypes == nil {
		roomTypes = []models.RoomType{}
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roomTypes)
}

func (h *RoomTypeHandler) CreateRoomType(w http.ResponseWriter, r *http.Request) {
	var roomType models.RoomType
	
	if err := json.NewDecoder(r.Body).Decode(&roomType); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}
	
	if roomType.Name == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Room type name is required"})
		return
	}
	
	query := `INSERT INTO room_types (name) VALUES ($1) RETURNING id, created_at`
	
	err := h.db.QueryRow(query, roomType.Name).Scan(&roomType.ID, &roomType.CreatedAt)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to create room type"})
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(roomType)
}

func (h *RoomTypeHandler) DeleteRoomType(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid room type ID"})
		return
	}
	
	// Check if room type is in use
	var count int
	checkQuery := `SELECT COUNT(*) FROM rooms WHERE type_id = $1`
	h.db.QueryRow(checkQuery, id).Scan(&count)
	
	if count > 0 {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "Cannot delete room type that is in use"})
		return
	}
	
	query := `DELETE FROM room_types WHERE id = $1`
	result, err := h.db.Exec(query, id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to delete room type"})
		return
	}
	
	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Room type not found"})
		return
	}
	
	w.WriteHeader(http.StatusNoContent)
}