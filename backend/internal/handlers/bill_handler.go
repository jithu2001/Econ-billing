package handlers

import (
	"net/http"
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BillHandler struct {
	service *services.BillService
}

func NewBillHandler(service *services.BillService) *BillHandler {
	return &BillHandler{service: service}
}

type CreateBillRequest struct {
	CustomerID     uuid.UUID               `json:"customer_id" binding:"required"`
	ReservationID  *uuid.UUID              `json:"reservation_id"`
	BillType       models.BillType         `json:"bill_type" binding:"required"`
	BillDate       string                  `json:"bill_date" binding:"required"`
	IsGSTBill      bool                    `json:"is_gst_bill"`
	Subtotal       float64                 `json:"subtotal"`
	TaxAmount      float64                 `json:"tax_amount"`
	DiscountAmount float64                 `json:"discount_amount"`
	TotalAmount    float64                 `json:"total_amount" binding:"required"`
	Status         models.BillStatus       `json:"status"`
	LineItems      []models.BillLineItem   `json:"line_items"`
}

func (h *BillHandler) Create(c *gin.Context) {
	var req CreateBillRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("userID")

	bill := &models.Bill{
		ID:             uuid.New(),
		CustomerID:     req.CustomerID,
		ReservationID:  req.ReservationID,
		BillType:       req.BillType,
		BillDate:       req.BillDate,
		IsGSTBill:      req.IsGSTBill,
		Subtotal:       req.Subtotal,
		TaxAmount:      req.TaxAmount,
		DiscountAmount: req.DiscountAmount,
		TotalAmount:    req.TotalAmount,
		Status:         req.Status,
		GeneratedBy:    userID.(uuid.UUID),
	}

	if err := h.service.CreateBill(bill, req.LineItems); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, bill)
}

func (h *BillHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	bill, err := h.service.GetBillByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bill not found"})
		return
	}

	c.JSON(http.StatusOK, bill)
}

func (h *BillHandler) GetByCustomerID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	bills, err := h.service.GetBillsByCustomerID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, bills)
}

func (h *BillHandler) Finalize(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := h.service.FinalizeBill(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bill finalized"})
}
