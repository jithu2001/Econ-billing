package repository

import (
	"github.com/econ/econ/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SettingsRepository struct {
	db *gorm.DB
}

func NewSettingsRepository(db *gorm.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

func (r *SettingsRepository) Get(userID uuid.UUID) (*models.Settings, error) {
	var settings models.Settings
	result := r.db.Where("user_id = ?", userID).First(&settings)
	if result.Error != nil {
		return nil, result.Error
	}
	return &settings, nil
}

func (r *SettingsRepository) Create(settings *models.Settings) error {
	return r.db.Create(settings).Error
}

func (r *SettingsRepository) Update(settings *models.Settings) error {
	return r.db.Save(settings).Error
}

func (r *SettingsRepository) Upsert(settings *models.Settings, userID uuid.UUID) error {
	var existing models.Settings
	result := r.db.Where("user_id = ?", userID).First(&existing)

	if result.Error == gorm.ErrRecordNotFound {
		settings.UserID = userID
		return r.db.Create(settings).Error
	}

	settings.ID = existing.ID
	settings.UserID = userID
	settings.CreatedAt = existing.CreatedAt
	return r.db.Save(settings).Error
}

// GetAndIncrementGSTInvoiceNumber atomically gets the next GST invoice number and increments it
func (r *SettingsRepository) GetAndIncrementGSTInvoiceNumber(userID uuid.UUID) (prefix string, number int, err error) {
	var settings models.Settings

	err = r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("user_id = ?", userID).First(&settings).Error; err != nil {
			return err
		}

		prefix = settings.GSTInvoicePrefix
		number = settings.GSTInvoiceNextNumber

		// Increment the number
		return tx.Model(&settings).Update("gst_invoice_next_number", settings.GSTInvoiceNextNumber+1).Error
	})

	return prefix, number, err
}

// GetAndIncrementNonGSTInvoiceNumber atomically gets the next Non-GST invoice number and increments it
func (r *SettingsRepository) GetAndIncrementNonGSTInvoiceNumber(userID uuid.UUID) (prefix string, number int, err error) {
	var settings models.Settings

	err = r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("user_id = ?", userID).First(&settings).Error; err != nil {
			return err
		}

		prefix = settings.NonGSTInvoicePrefix
		number = settings.NonGSTInvoiceNextNumber

		// Increment the number
		return tx.Model(&settings).Update("non_gst_invoice_next_number", settings.NonGSTInvoiceNextNumber+1).Error
	})

	return prefix, number, err
}

// CreateDefaultSettings creates default settings for a new user
func (r *SettingsRepository) CreateDefaultSettings(userID uuid.UUID) error {
	settings := &models.Settings{
		UserID:                  userID,
		LodgeName:               "My Lodge",
		Address:                 "",
		Phone:                   "",
		GSTNumber:               "",
		StateName:               "",
		StateCode:               "",
		GSTInvoicePrefix:        "GST",
		GSTInvoiceNextNumber:    1,
		NonGSTInvoicePrefix:     "INV",
		NonGSTInvoiceNextNumber: 1,
	}
	return r.db.Create(settings).Error
}
