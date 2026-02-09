package handlers

import (
	"net/http"
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SettingsHandler struct {
	service *services.SettingsService
}

func NewSettingsHandler(service *services.SettingsService) *SettingsHandler {
	return &SettingsHandler{service: service}
}

type SettingsRequest struct {
	LodgeName               string `json:"lodge_name" binding:"required"`
	Address                 string `json:"address"`
	Phone                   string `json:"phone"`
	GSTNumber               string `json:"gst_number"`
	StateName               string `json:"state_name"`
	StateCode               string `json:"state_code"`
	GSTInvoicePrefix        string `json:"gst_invoice_prefix"`
	GSTInvoiceNextNumber    int    `json:"gst_invoice_next_number"`
	NonGSTInvoicePrefix     string `json:"non_gst_invoice_prefix"`
	NonGSTInvoiceNextNumber int    `json:"non_gst_invoice_next_number"`
}

func (h *SettingsHandler) Get(c *gin.Context) {
	userID, _ := c.Get("userID")

	settings, err := h.service.Get(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, settings)
}

func (h *SettingsHandler) Save(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req SettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	settings := &models.Settings{
		LodgeName:               req.LodgeName,
		Address:                 req.Address,
		Phone:                   req.Phone,
		GSTNumber:               req.GSTNumber,
		StateName:               req.StateName,
		StateCode:               req.StateCode,
		GSTInvoicePrefix:        req.GSTInvoicePrefix,
		GSTInvoiceNextNumber:    req.GSTInvoiceNextNumber,
		NonGSTInvoicePrefix:     req.NonGSTInvoicePrefix,
		NonGSTInvoiceNextNumber: req.NonGSTInvoiceNextNumber,
	}

	if err := h.service.Save(settings, userID.(uuid.UUID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, settings)
}
