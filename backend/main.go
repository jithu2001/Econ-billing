package main

import (
	"hotel-mgmt/internal/db"
	"hotel-mgmt/internal/routes"
	"log"
	"net/http"
	"os"
)

func main() {
	database := db.Init()
	db.Migrate(database)

	mux := http.NewServeMux()
	routes.RegisterRoutes(mux, database)

	// Serve built React frontend (after npm run build)
	if _, err := os.Stat("frontend/dist"); err == nil {
		mux.Handle("/", http.FileServer(http.Dir("frontend/dist")))
	}

	log.Println("Server running at http://localhost:8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
