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

func CreatePaymentHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		var p models.Payment
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			utils.BadRequest(w, "Invalid request body")
			return
		}

		if strings.TrimSpace(p.Method) == "" {
			utils.BadRequest(w, "Payment method is required")
			return
		}

		id, err := repository.CreatePayment(db, p)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Created(w, map[string]interface{}{"id": id, "message": "Payment created successfully"})
	}
}

func ListPaymentsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		billIDStr := r.URL.Query().Get("bill_id")
		if billIDStr == "" {
			utils.BadRequest(w, "bill_id is required")
			return
		}

		billID, err := strconv.ParseInt(billIDStr, 10, 64)
		if err != nil {
			utils.BadRequest(w, "Invalid bill_id")
			return
		}

		payments, err := repository.ListPayments(db, billID)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, payments)
	}
}
