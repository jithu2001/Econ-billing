package utils

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func SaveUpload(r *http.Request, fieldName, uploadDir string) (string, error) {
	file, header, err := r.FormFile(fieldName)
	if err != nil {
		return "", err
	}
	defer file.Close()

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", err
	}

	ext := filepath.Ext(header.Filename)
	filename := strings.TrimSuffix(header.Filename, ext) + "_" + generateRandomString(8) + ext
	filepath := filepath.Join(uploadDir, filename)

	dst, err := os.Create(filepath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", err
	}

	return filepath, nil
}

func GetUploadPath(uploadType, filename string) string {
	return filepath.Join("uploads", uploadType, filename)
}

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[i%len(charset)]
	}
	return string(b)
}
