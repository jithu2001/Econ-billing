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

func CreateBillHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		var b models.Bill
		if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
			utils.BadRequest(w, "Invalid request body")
			return
		}

		id, err := repository.CreateBill(db, b)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Created(w, map[string]interface{}{"id": id, "message": "Bill created successfully"})
	}
}

func GetBillHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		billIDStr := r.URL.Query().Get("id")
		if billIDStr == "" {
			utils.BadRequest(w, "id is required")
			return
		}

		billID, err := strconv.ParseInt(billIDStr, 10, 64)
		if err != nil {
			utils.BadRequest(w, "Invalid id")
			return
		}

		bill, err := repository.GetBill(db, billID)
		if err != nil {
			if err == sql.ErrNoRows {
				utils.NotFound(w, "Bill not found")
				return
			}
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, bill)
	}
}

func ListBillsHandler(db *sql.DB) http.HandlerFunc {
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

		bills, err := repository.ListBills(db, reservationID)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Success(w, bills)
	}
}

func CreateBillItemHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			utils.BadRequest(w, "Method not allowed")
			return
		}

		var item models.BillItem
		if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
			utils.BadRequest(w, "Invalid request body")
			return
		}

		id, err := repository.CreateBillItem(db, item)
		if err != nil {
			utils.ServerError(w, err.Error())
			return
		}

		utils.Created(w, map[string]interface{}{"id": id, "message": "Bill item created successfully"})
	}
}
