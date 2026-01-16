package main

import (
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path"
	"runtime"
	"strings"
	"trinity-lodge/internal/config"
	"trinity-lodge/internal/handlers"
	"trinity-lodge/internal/middleware"
	"trinity-lodge/internal/repository"
	"trinity-lodge/internal/routes"
	"trinity-lodge/internal/services"
	"trinity-lodge/internal/web"

	"github.com/gin-gonic/gin"
)

// openBrowser opens the specified URL in the default browser
func openBrowser(url string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default: // Linux and others
		cmd = exec.Command("xdg-open", url)
	}
	return cmd.Start()
}

func main() {
	// Check for command line flags
	serverOnly := false
	noBrowser := false
	for _, arg := range os.Args[1:] {
		if arg == "--server" || arg == "-s" {
			serverOnly = true
		}
		if arg == "--no-browser" || arg == "-n" {
			noBrowser = true
		}
	}

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
	settingsRepo := repository.NewSettingsRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, cfg.JWTSecret)
	customerService := services.NewCustomerService(customerRepo)
	roomService := services.NewRoomService(roomRepo)
	reservationService := services.NewReservationService(reservationRepo, roomRepo)
	billService := services.NewBillService(billRepo)
	paymentService := services.NewPaymentService(paymentRepo, billRepo)
	settingsService := services.NewSettingsService(settingsRepo)

	// Initialize handlers
	h := &routes.Handlers{
		Auth:        handlers.NewAuthHandler(authService, cfg),
		Customer:    handlers.NewCustomerHandler(customerService),
		Room:        handlers.NewRoomHandler(roomService),
		Reservation: handlers.NewReservationHandler(reservationService),
		Bill:        handlers.NewBillHandler(billService),
		Payment:     handlers.NewPaymentHandler(paymentService),
		Settings:    handlers.NewSettingsHandler(settingsService),
	}

	// Setup Gin router
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())

	// Apply CORS middleware
	router.Use(middleware.CORSMiddleware(cfg.AllowedOrigins))

	// Setup API routes
	routes.SetupRoutes(router, h, cfg.JWTSecret)

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Get embedded filesystem
	staticFS := web.GetFS()

	// Helper function to serve a file from the embedded FS
	serveFile := func(c *gin.Context, filename string) {
		file, err := staticFS.Open(filename)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
			return
		}
		defer file.Close()

		content, err := io.ReadAll(file)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file"})
			return
		}

		// Set content type based on file extension
		ext := path.Ext(filename)
		contentType := "application/octet-stream"
		switch ext {
		case ".html":
			contentType = "text/html; charset=utf-8"
		case ".css":
			contentType = "text/css; charset=utf-8"
		case ".js":
			contentType = "application/javascript; charset=utf-8"
		case ".svg":
			contentType = "image/svg+xml"
		case ".png":
			contentType = "image/png"
		case ".jpg", ".jpeg":
			contentType = "image/jpeg"
		case ".ico":
			contentType = "image/x-icon"
		case ".json":
			contentType = "application/json"
		case ".woff":
			contentType = "font/woff"
		case ".woff2":
			contentType = "font/woff2"
		}

		c.Data(http.StatusOK, contentType, content)
	}

	// Serve index.html for root path
	router.GET("/", func(c *gin.Context) {
		serveFile(c, "index.html")
	})

	// Serve static assets
	router.GET("/assets/*filepath", func(c *gin.Context) {
		filepath := c.Param("filepath")
		serveFile(c, "assets"+filepath)
	})

	// Serve other static files
	router.GET("/vite.svg", func(c *gin.Context) {
		serveFile(c, "vite.svg")
	})

	// Handle SPA routing - serve index.html for all other routes
	router.NoRoute(func(c *gin.Context) {
		urlPath := c.Request.URL.Path

		// Skip API routes
		if strings.HasPrefix(urlPath, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
			return
		}

		// For SPA routing, serve index.html
		serveFile(c, "index.html")
	})

	// Find an available port
	port := cfg.ServerPort
	listener, err := net.Listen("tcp", ":"+port)
	if err != nil {
		// Try to find another port
		listener, err = net.Listen("tcp", ":0")
		if err != nil {
			log.Fatalf("Failed to find available port: %v", err)
		}
		port = fmt.Sprintf("%d", listener.Addr().(*net.TCPAddr).Port)
	}

	serverURL := fmt.Sprintf("http://localhost:%s", port)

	// Get lodge name for display
	settings, _ := settingsService.Get()
	appName := "Econ"
	if settings != nil && settings.LodgeName != "" {
		appName = settings.LodgeName
	}

	fmt.Println("╔════════════════════════════════════════════════════════╗")
	fmt.Printf("║  %s%-50s%s  ║\n", "\033[1;35m", appName, "\033[0m")
	fmt.Println("╠════════════════════════════════════════════════════════╣")
	fmt.Printf("║  Server running at: %-35s ║\n", serverURL)
	fmt.Println("║                                                        ║")
	fmt.Println("║  Press Ctrl+C to stop the server                       ║")
	fmt.Println("╚════════════════════════════════════════════════════════╝")
	fmt.Println()

	// Open browser automatically unless disabled
	if !serverOnly && !noBrowser {
		if err := openBrowser(serverURL); err != nil {
			log.Printf("Failed to open browser: %v", err)
			log.Printf("Please open %s manually", serverURL)
		}
	}

	// Start server
	if err := http.Serve(listener, router); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
