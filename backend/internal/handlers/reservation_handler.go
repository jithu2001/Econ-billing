package handlers

import (
	"net/http"
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ReservationHandler struct {
	service *services.ReservationService
}

func NewReservationHandler(service *services.ReservationService) *ReservationHandler {
	return &ReservationHandler{service: service}
}

func (h *ReservationHandler) Create(c *gin.Context) {
	var reservation models.Reservation
	if err := c.ShouldBindJSON(&reservation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reservation.ID = uuid.New()
	if err := h.service.CreateReservation(&reservation); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, reservation)
}

func (h *ReservationHandler) GetAll(c *gin.Context) {
	reservations, err := h.service.GetAllReservations()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, reservations)
}

func (h *ReservationHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	reservation, err := h.service.GetReservationByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reservation not found"})
		return
	}

	c.JSON(http.StatusOK, reservation)
}

func (h *ReservationHandler) CheckIn(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := h.service.CheckInReservation(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Check-in successful"})
}

func (h *ReservationHandler) Cancel(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	if err := h.service.CancelReservation(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Reservation cancelled successfully"})
}

func (h *ReservationHandler) Checkout(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var req struct {
		CheckoutDate string `json:"checkout_date" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.CheckoutReservation(id, req.CheckoutDate); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Checkout successful"})
}
