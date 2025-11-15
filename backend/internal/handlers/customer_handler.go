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

func CreateCustomerHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		var c models.Customer
		if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
			utils.BadRequest(w, "Invalid request body")
			return
		}

		if strings.TrimSpace(c.Name) == "" {
			utils.BadRequest(w, "Name is required")
			return
		}

		id, err := repository.CreateCustomer(db, c)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Created(w, map[string]interface{}{"id": id, "message": "Customer created successfully"})
	}
}

func ListCustomersHandler(db *sql.DB) http.HandlerFunc {
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

		customers, err := repository.ListCustomers(db, propertyID)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, customers)
	}
}

func GetCustomerHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		customerIDStr := r.URL.Query().Get("id")
		if customerIDStr == "" {
			utils.BadRequest(w, "id is required")
			return
		}

		customerID, err := strconv.ParseInt(customerIDStr, 10, 64)
		if err != nil {
			utils.BadRequest(w, "Invalid id")
			return
		}

		customer, err := repository.GetCustomer(db, customerID)
		if err != nil {
			if err == sql.ErrNoRows {
				utils.NotFound(w, "Customer not found")
				return
			}
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, customer)
	}
}
