package utils

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// SaveUploadedFile saves an uploaded file to the specified directory
func SaveUploadedFile(file multipart.File, header *multipart.FileHeader, uploadDir string) (string, error) {
	// Validate file type (only images)
	contentType := header.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		return "", fmt.Errorf("invalid file type: only images are allowed")
	}

	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), strings.ReplaceAll(header.Filename, ext, ""), ext)
	
	// Create full path
	fullPath := filepath.Join(uploadDir, filename)
	
	// Ensure the upload directory exists
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %v", err)
	}
	
	// Create the file
	dst, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer dst.Close()
	
	// Copy file content
	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}
	
	return filename, nil
}