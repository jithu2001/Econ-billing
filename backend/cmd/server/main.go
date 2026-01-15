package main

import (
	"log"
	"trinity-lodge/internal/config"
	"trinity-lodge/internal/handlers"
	"trinity-lodge/internal/middleware"
	"trinity-lodge/internal/repository"
	"trinity-lodge/internal/routes"
	"trinity-lodge/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Initialize database
	db := config.InitDatabase(cfg.DatabasePath)

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	customerRepo := repository.NewCustomerRepository(db)
	roomRepo := repository.NewRoomRepository(db)
	reservationRepo := repository.NewReservationRepository(db)
	billRepo := repository.NewBillRepository(db)
	paymentRepo := repository.NewPaymentRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg.JWTSecret)
	customerService := services.NewCustomerService(customerRepo)
	roomService := services.NewRoomService(roomRepo)
	reservationService := services.NewReservationService(reservationRepo, roomRepo)
	billService := services.NewBillService(billRepo)
	paymentService := services.NewPaymentService(paymentRepo, billRepo)

	// Initialize handlers
	h := &routes.Handlers{
		Auth:        handlers.NewAuthHandler(authService, cfg),
		Customer:    handlers.NewCustomerHandler(customerService),
		Room:        handlers.NewRoomHandler(roomService),
		Reservation: handlers.NewReservationHandler(reservationService),
		Bill:        handlers.NewBillHandler(billService),
		Payment:     handlers.NewPaymentHandler(paymentService),
	}

	// Setup Gin router
	router := gin.Default()

	// Apply CORS middleware
	router.Use(middleware.CORSMiddleware(cfg.AllowedOrigins))

	// Setup routes
	routes.SetupRoutes(router, h, cfg.JWTSecret)

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Start server
	log.Printf("Server starting on port %s", cfg.ServerPort)
	if err := router.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
