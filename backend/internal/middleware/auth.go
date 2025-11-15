package middleware

import (
	"database/sql"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"
)

func AuthMiddleware(db *sql.DB) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			propertyIDStr := r.URL.Query().Get("property_id")
			if propertyIDStr == "" {
				http.Error(w, "property_id required", http.StatusUnauthorized)
				return
			}

			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			token := strings.TrimPrefix(authHeader, "Bearer ")
			if token == "" {
				http.Error(w, "Invalid authorization header", http.StatusUnauthorized)
				return
			}

			var storedHash string
			err := db.QueryRow("SELECT password_hash FROM properties WHERE id = ?", propertyIDStr).Scan(&storedHash)
			if err != nil {
				http.Error(w, "Invalid property", http.StatusUnauthorized)
				return
			}

			hash := sha256.Sum256([]byte(token))
			providedHash := hex.EncodeToString(hash[:])

			if providedHash != storedHash {
				http.Error(w, "Invalid credentials", http.StatusUnauthorized)
				return
			}

			next(w, r)
		}
	}
}

func SimpleAuth(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		handler(w, r)
	}
}
