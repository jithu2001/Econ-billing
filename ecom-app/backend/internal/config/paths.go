package config

import (
	"os"
	"path/filepath"
)

// GetUploadsDir returns the uploads directory path, ensuring it's OS-appropriate
func GetUploadsDir() string {
	// Get base directory - could be from env var or default
	baseDir := os.Getenv("UPLOADS_DIR")
	if baseDir == "" {
		baseDir = "uploads"
	}
	
	// Ensure it's an absolute path
	if !filepath.IsAbs(baseDir) {
		// Get current working directory
		cwd, err := os.Getwd()
		if err != nil {
			// Fallback to relative path
			return baseDir
		}
		baseDir = filepath.Join(cwd, baseDir)
	}
	
	return baseDir
}

// GetIDCardsDir returns the ID cards upload directory
func GetIDCardsDir() string {
	return filepath.Join(GetUploadsDir(), "ids")
}

// EnsureUploadDirs creates all necessary upload directories
func EnsureUploadDirs() error {
	dirs := []string{
		GetUploadsDir(),
		GetIDCardsDir(),
	}
	
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}
	}
	
	return nil
}