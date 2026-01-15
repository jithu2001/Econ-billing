package config

import (
	"log"
	"trinity-lodge/internal/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitDatabase(dbPath string) *gorm.DB {
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate all models
	err = db.AutoMigrate(
		&models.User{},
		&models.Customer{},
		&models.RoomType{},
		&models.Room{},
		&models.Reservation{},
		&models.Bill{},
		&models.BillLineItem{},
		&models.Payment{},
		&models.Settings{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database connected and migrated successfully")
	return db
}
