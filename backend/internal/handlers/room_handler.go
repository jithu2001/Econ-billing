package handlers

import (
	"net/http"
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RoomHandler struct {
	service *services.RoomService
}

func NewRoomHandler(service *services.RoomService) *RoomHandler {
	return &RoomHandler{service: service}
}

// Room Type handlers
func (h *RoomHandler) CreateRoomType(c *gin.Context) {
	var roomType models.RoomType
	if err := c.ShouldBindJSON(&roomType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	roomType.ID = uuid.New()
	if err := h.service.CreateRoomType(&roomType); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, roomType)
}

func (h *RoomHandler) GetAllRoomTypes(c *gin.Context) {
	roomTypes, err := h.service.GetAllRoomTypes()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, roomTypes)
}

func (h *RoomHandler) UpdateRoomType(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var roomType models.RoomType
	if err := c.ShouldBindJSON(&roomType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	roomType.ID = id
	if err := h.service.UpdateRoomType(&roomType); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, roomType)
}

// Room handlers
func (h *RoomHandler) CreateRoom(c *gin.Context) {
	var room models.Room
	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	room.ID = uuid.New()
	if err := h.service.CreateRoom(&room); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, room)
}

func (h *RoomHandler) GetAllRooms(c *gin.Context) {
	rooms, err := h.service.GetAllRooms()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, rooms)
}

func (h *RoomHandler) UpdateRoom(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var room models.Room
	if err := c.ShouldBindJSON(&room); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	room.ID = id
	if err := h.service.UpdateRoom(&room); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, room)
}
