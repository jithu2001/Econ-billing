package handlers

import (
	"net/http"
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/services"

	"github.com/gin-gonic/gin"
)

type SettingsHandler struct {
	service *services.SettingsService
}

func NewSettingsHandler(service *services.SettingsService) *SettingsHandler {
	return &SettingsHandler{service: service}
}

type SettingsRequest struct {
	LodgeName string `json:"lodge_name" binding:"required"`
	Address   string `json:"address"`
	Phone     string `json:"phone"`
	GSTNumber string `json:"gst_number"`
	StateName string `json:"state_name"`
	StateCode string `json:"state_code"`
}

func (h *SettingsHandler) Get(c *gin.Context) {
	settings, err := h.service.Get()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, settings)
}

func (h *SettingsHandler) Save(c *gin.Context) {
	var req SettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	settings := &models.Settings{
		LodgeName: req.LodgeName,
		Address:   req.Address,
		Phone:     req.Phone,
		GSTNumber: req.GSTNumber,
		StateName: req.StateName,
		StateCode: req.StateCode,
	}

	if err := h.service.Save(settings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, settings)
}
