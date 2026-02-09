package services

import (
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/repository"

	"github.com/google/uuid"
)

type SettingsService struct {
	repo *repository.SettingsRepository
}

func NewSettingsService(repo *repository.SettingsRepository) *SettingsService {
	return &SettingsService{repo: repo}
}

func (s *SettingsService) Get(userID uuid.UUID) (*models.Settings, error) {
	settings, err := s.repo.Get(userID)
	if err != nil {
		// Return default settings if not found
		return &models.Settings{
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
		}, nil
	}
	return settings, nil
}

func (s *SettingsService) Save(settings *models.Settings, userID uuid.UUID) error {
	return s.repo.Upsert(settings, userID)
}

func (s *SettingsService) CreateDefaultSettings(userID uuid.UUID) error {
	return s.repo.CreateDefaultSettings(userID)
}
