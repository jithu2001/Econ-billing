package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"ecom-app/internal/database"
	"ecom-app/internal/models"
)

type SettingsHandler struct {
	db *database.DB
}

func NewSettingsHandler(db *database.DB) *SettingsHandler {
	return &SettingsHandler{db: db}
}

func (h *SettingsHandler) GetSettings(w http.ResponseWriter, r *http.Request) {
	var settings models.BusinessSettings
	
	query := `SELECT id, property_name, property_address, gst_number, gst_percentage, created_at, updated_at 
			  FROM business_settings LIMIT 1`
	
	err := h.db.QueryRow(query).Scan(
		&settings.ID,
		&settings.PropertyName,
		&settings.PropertyAddress,
		&settings.GSTNumber,
		&settings.GSTPercentage,
		&settings.CreatedAt,
		&settings.UpdatedAt,
	)
	
	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "No settings found"})
		return
	}
	
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to fetch settings"})
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(settings)
}

func (h *SettingsHandler) SaveSettings(w http.ResponseWriter, r *http.Request) {
	var settings models.BusinessSettings
	
	if err := json.NewDecoder(r.Body).Decode(&settings); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}
	
	// Validate GST percentage
	if settings.GSTPercentage < 0 || settings.GSTPercentage > 100 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "GST percentage must be between 0 and 100"})
		return
	}
	
	// Check if settings exist
	var count int
	h.db.QueryRow("SELECT COUNT(*) FROM business_settings").Scan(&count)
	
	if count > 0 {
		// Update existing settings
		query := `UPDATE business_settings 
				  SET property_name = $1, property_address = $2, gst_number = $3, 
					  gst_percentage = $4, updated_at = CURRENT_TIMESTAMP
				  WHERE true
				  RETURNING id, created_at, updated_at`
		
		err := h.db.QueryRow(query, 
			settings.PropertyName,
			settings.PropertyAddress,
			settings.GSTNumber,
			settings.GSTPercentage,
		).Scan(&settings.ID, &settings.CreatedAt, &settings.UpdatedAt)
		
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update settings"})
			return
		}
	} else {
		// Insert new settings
		query := `INSERT INTO business_settings (property_name, property_address, gst_number, gst_percentage)
				  VALUES ($1, $2, $3, $4)
				  RETURNING id, created_at, updated_at`
		
		err := h.db.QueryRow(query,
			settings.PropertyName,
			settings.PropertyAddress,
			settings.GSTNumber,
			settings.GSTPercentage,
		).Scan(&settings.ID, &settings.CreatedAt, &settings.UpdatedAt)
		
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to save settings"})
			return
		}
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(settings)
}