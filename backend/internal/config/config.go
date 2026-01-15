package config

import (
	"os"
)

type Config struct {
	ServerPort     string
	DatabasePath   string
	JWTSecret      string
	AllowedOrigins []string
}

func LoadConfig() *Config {
	return &Config{
		ServerPort:   getEnv("SERVER_PORT", "8080"),
		DatabasePath: getEnv("DATABASE_PATH", "./trinity.db"),
		JWTSecret:    getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
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
