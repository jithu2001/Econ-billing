package database

import (
	"errors"
	"os"
	"path/filepath"

	"github.com/econ/econ/internal/models"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// ResolveDBPath returns %APPDATA%/econ/econ.db on Windows, creating the parent dir.
func ResolveDBPath() (string, error) {
	base := os.Getenv("APPDATA")
	if base == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		base = filepath.Join(home, ".config")
	}
	dir := filepath.Join(base, "econ")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	return filepath.Join(dir, "econ.db"), nil
}

func Open(path string) (*gorm.DB, error) {
	if path == "" {
		return nil, errors.New("empty db path")
	}
	db, err := gorm.Open(sqlite.Open(path), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		return nil, err
	}
	if err := db.AutoMigrate(
		&models.User{}, &models.Customer{}, &models.RoomType{},
		&models.Room{}, &models.Reservation{}, &models.Bill{},
		&models.BillLineItem{}, &models.Payment{}, &models.Settings{},
	); err != nil {
		return nil, err
	}
	return db, nil
}

func Close(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
