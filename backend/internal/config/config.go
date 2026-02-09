package config

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"os"
	"path/filepath"
	"strings"
)

type Config struct {
	ServerPort        string
	DatabasePath      string
	JWTSecret         string
	RegistrationToken string
	AllowedOrigins    []string
}

func LoadConfig() *Config {
	dbPath := getEnv("DATABASE_PATH", "./trinity.db")

	return &Config{
		ServerPort:        getEnv("SERVER_PORT", "8080"),
		DatabasePath:      dbPath,
		JWTSecret:         getOrGenerateJWTSecret(dbPath),
		RegistrationToken: getEnv("REGISTRATION_TOKEN", "919847073856"),
		AllowedOrigins: []string{
			"http://localhost:5173",
			"http://localhost:5174",
			"http://localhost:5175",
			getEnv("FRONTEND_URL", "http://localhost:5173"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getOrGenerateJWTSecret returns the JWT secret from env, or reads/generates one from a file
func getOrGenerateJWTSecret(dbPath string) string {
	// If explicitly set via env, use that
	if secret := os.Getenv("JWT_SECRET"); secret != "" {
		return secret
	}

	// Store the secret file next to the database
	secretFile := filepath.Join(filepath.Dir(dbPath), ".jwt_secret")

	// Try to read existing secret
	data, err := os.ReadFile(secretFile)
	if err == nil {
		secret := strings.TrimSpace(string(data))
		if len(secret) >= 32 {
			return secret
		}
	}

	// Generate a new random secret
	key := make([]byte, 32)
	if _, err := rand.Read(key); err != nil {
		log.Fatalf("Failed to generate JWT secret: %v", err)
	}
	secret := hex.EncodeToString(key)

	// Save to file
	if err := os.WriteFile(secretFile, []byte(secret), 0600); err != nil {
		log.Printf("Warning: could not save JWT secret to file: %v", err)
	}

	return secret
}
