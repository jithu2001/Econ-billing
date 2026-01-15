package services

import (
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/repository"
)

type SettingsService struct {
	repo *repository.SettingsRepository
}

func NewSettingsService(repo *repository.SettingsRepository) *SettingsService {
	return &SettingsService{repo: repo}
}

func (s *SettingsService) Get() (*models.Settings, error) {
	settings, err := s.repo.Get()
	if err != nil {
		// Return default settings if not found
		return &models.Settings{
			LodgeName: "Trinity Lodge",
			Address:   "",
			Phone:     "",
			GSTNumber: "",
			StateName: "",
			StateCode: "",
		}, nil
	}
	return settings, nil
}

func (s *SettingsService) Save(settings *models.Settings) error {
	return s.repo.Upsert(settings)
}
