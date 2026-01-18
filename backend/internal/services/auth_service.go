package services

import (
	"errors"
	"trinity-lodge/internal/models"
	"trinity-lodge/internal/repository"
	"trinity-lodge/pkg/utils"

	"github.com/google/uuid"
)

type AuthService struct {
	userRepo  *repository.UserRepository
	jwtSecret string
}

func NewAuthService(userRepo *repository.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

func (s *AuthService) Login(username, password string) (string, *models.User, error) {
	user, err := s.userRepo.FindByUsername(username)
	if err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	if !utils.CheckPassword(password, user.PasswordHash) {
		return "", nil, errors.New("invalid credentials")
	}

	token, err := utils.GenerateToken(user.ID, user.Username, string(user.Role), s.jwtSecret)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

func (s *AuthService) Register(username, password string, role models.UserRole) (string, *models.User, error) {
	// Check if user already exists
	existing, _ := s.userRepo.FindByUsername(username)
	if existing != nil {
		return "", nil, errors.New("username already exists")
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return "", nil, err
	}

	user := &models.User{
		ID:           uuid.New(),
		Username:     username,
		PasswordHash: hashedPassword,
		Role:         role,
	}

	err = s.userRepo.Create(user)
	if err != nil {
		return "", nil, err
	}

	// Generate token for auto-login after registration
	token, err := utils.GenerateToken(user.ID, user.Username, string(user.Role), s.jwtSecret)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}

func (s *AuthService) GetUserByID(id uuid.UUID) (*models.User, error) {
	return s.userRepo.FindByID(id)
}
