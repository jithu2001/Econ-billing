package handlers

import (
	"database/sql"
	"encoding/json"
	"hotel-mgmt/internal/repository"
	"hotel-mgmt/internal/utils"
	"net/http"
	"strconv"
	"strings"
)

func CreateTagHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		var req struct {
			PropertyID int64  `json:"property_id"`
			Name       string `json:"name"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			utils.BadRequest(w, "Invalid request body")
			return
		}

		if strings.TrimSpace(req.Name) == "" {
			utils.BadRequest(w, "Name is required")
			return
		}

		id, err := repository.CreateTag(db, req.PropertyID, req.Name)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Created(w, map[string]interface{}{"id": id, "message": "Tag created successfully"})
	}
}

func ListTagsHandler(db *sql.DB) http.HandlerFunc {
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

		tags, err := repository.ListTags(db, propertyID)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, tags)
	}
}

func DeleteTagHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		tagIDStr := r.URL.Query().Get("id")
		if tagIDStr == "" {
			utils.BadRequest(w, "id is required")
			return
		}

		tagID, err := strconv.ParseInt(tagIDStr, 10, 64)
		if err != nil {
			utils.BadRequest(w, "Invalid id")
			return
		}

		if err := repository.DeleteTag(db, tagID); err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, map[string]interface{}{"message": "Tag deleted successfully"})
	}
}
