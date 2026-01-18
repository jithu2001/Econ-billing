package repository

import (
	"trinity-lodge/internal/models"

	"gorm.io/gorm"
)

type SettingsRepository struct {
	db *gorm.DB
}

func NewSettingsRepository(db *gorm.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

func (r *SettingsRepository) Get() (*models.Settings, error) {
	var settings models.Settings
	result := r.db.First(&settings)
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

func (r *SettingsRepository) Upsert(settings *models.Settings) error {
	var existing models.Settings
	result := r.db.First(&existing)

	if result.Error == gorm.ErrRecordNotFound {
		return r.db.Create(settings).Error
	}

	settings.ID = existing.ID
	settings.CreatedAt = existing.CreatedAt
	return r.db.Save(settings).Error
}
