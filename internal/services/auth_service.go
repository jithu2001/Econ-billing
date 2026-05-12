package services

import (
	"errors"
	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/repository"
	"github.com/econ/econ/pkg/utils"

	"github.com/google/uuid"
)

type AuthService struct {
	userRepo     *repository.UserRepository
	settingsRepo *repository.SettingsRepository
}

func NewAuthService(userRepo *repository.UserRepository, settingsRepo *repository.SettingsRepository) *AuthService {
	return &AuthService{userRepo: userRepo, settingsRepo: settingsRepo}
}

func (s *AuthService) Login(username, password string) (*models.User, error) {
	user, err := s.userRepo.FindByUsername(username)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}
	if !utils.CheckPassword(password, user.PasswordHash) {
		return nil, errors.New("invalid credentials")
	}
	return user, nil
}

func (s *AuthService) Register(username, password string, role models.UserRole) (*models.User, error) {
	if existing, _ := s.userRepo.FindByUsername(username); existing != nil {
		return nil, errors.New("username already exists")
	}
	hashed, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}
	user := &models.User{
		ID: uuid.New(), Username: username, PasswordHash: hashed, Role: role,
	}
	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}
	_ = s.settingsRepo.CreateDefaultSettings(user.ID)
	return user, nil
}

func (s *AuthService) GetUserByID(id uuid.UUID) (*models.User, error) {
	return s.userRepo.FindByID(id)
}
