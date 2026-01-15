package routes

import (
	"trinity-lodge/internal/handlers"
	"trinity-lodge/internal/middleware"

	"github.com/gin-gonic/gin"
)

type Handlers struct {
	Auth        *handlers.AuthHandler
	Customer    *handlers.CustomerHandler
	Room        *handlers.RoomHandler
	Reservation *handlers.ReservationHandler
	Bill        *handlers.BillHandler
	Payment     *handlers.PaymentHandler
}

func SetupRoutes(router *gin.Engine, h *Handlers, jwtSecret string) {
	// Public routes
	auth := router.Group("/api/auth")
	{
		auth.POST("/login", h.Auth.Login)
		auth.POST("/register", h.Auth.Register)
	}

	// Protected routes
	api := router.Group("/api")
	api.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// Customers
		customers := api.Group("/customers")
		{
			customers.GET("", h.Customer.GetAll)
			customers.POST("", h.Customer.Create)
			customers.GET("/:id", h.Customer.GetByID)
			customers.PUT("/:id", h.Customer.Update)
			customers.DELETE("/:id", h.Customer.Delete)
			customers.GET("/:id/bills", h.Bill.GetByCustomerID)
		}

		// Room Types
		roomTypes := api.Group("/room-types")
		{
			roomTypes.GET("", h.Room.GetAllRoomTypes)
			roomTypes.POST("", h.Room.CreateRoomType)
			roomTypes.PUT("/:id", h.Room.UpdateRoomType)
		}

		// Rooms
		rooms := api.Group("/rooms")
		{
			rooms.GET("", h.Room.GetAllRooms)
			rooms.POST("", h.Room.CreateRoom)
			rooms.PUT("/:id", h.Room.UpdateRoom)
		}

		// Reservations
		reservations := api.Group("/reservations")
		{
			reservations.GET("", h.Reservation.GetAll)
			reservations.POST("", h.Reservation.Create)
			reservations.GET("/:id", h.Reservation.GetByID)
			reservations.PUT("/:id/checkin", h.Reservation.CheckIn)
			reservations.PUT("/:id/cancel", h.Reservation.Cancel)
			reservations.PUT("/:id/checkout", h.Reservation.Checkout)
		}

		// Bills
		bills := api.Group("/bills")
		{
			bills.POST("", h.Bill.Create)
			bills.GET("/:id", h.Bill.GetByID)
			bills.POST("/:id/finalize", h.Bill.Finalize)
			bills.POST("/:id/payments", h.Payment.Create)
			bills.GET("/:id/payments", h.Payment.GetByBillID)
		}
	}
}
