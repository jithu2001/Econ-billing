package handlers

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"hotel-mgmt/internal/models"
	"hotel-mgmt/internal/repository"
	"hotel-mgmt/internal/utils"
	"net/http"
	"strings"
)

func CreatePropertyHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		var req models.CreatePropertyRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.BadRequest(w, "Invalid request body")
			return
		}

		if strings.TrimSpace(req.Name) == "" {
			utils.BadRequest(w, "Name is required")
			return
		}

		if strings.TrimSpace(req.Password) == "" {
			utils.BadRequest(w, "Password is required")
			return
		}

		hash := sha256.Sum256([]byte(req.Password))
		passwordHash := hex.EncodeToString(hash[:])

		id, err := repository.CreateProperty(db, req, passwordHash)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Created(w, map[string]interface{}{"id": id, "message": "Property created successfully"})
	}
}

func ListPropertiesHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		props, err := repository.ListProperties(db)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, props)
	}
}
