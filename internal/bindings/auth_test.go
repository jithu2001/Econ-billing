// internal/bindings/auth_test.go
package bindings

import (
	"testing"

	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/repository"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
)

func newTestAuth(t *testing.T) (*AuthBinding, *session.Session) {
	t.Helper()
	db := openTestDB(t)
	sess := session.New()
	userRepo := repository.NewUserRepository(db)
	settingsRepo := repository.NewSettingsRepository(db)
	svc := services.NewAuthService(userRepo, settingsRepo)
	return NewAuthBinding(svc, sess, "TEST_TOKEN"), sess
}

func TestAuth_RegisterThenLogin(t *testing.T) {
	b, sess := newTestAuth(t)
	_, err := b.Register("alice", "secret123", "ADMIN", "TEST_TOKEN")
	if err != nil {
		t.Fatalf("register: %v", err)
	}
	if !sess.IsAuthenticated() {
		t.Fatal("expected session set by Register")
	}

	b.Logout()
	if sess.IsAuthenticated() {
		t.Fatal("Logout did not clear session")
	}

	res, err := b.Login("alice", "secret123")
	if err != nil {
		t.Fatalf("login: %v", err)
	}
	if res.User.Username != "alice" {
		t.Fatalf("got %q", res.User.Username)
	}
	if res.User.Role != models.RoleAdmin {
		t.Fatalf("got role %q", res.User.Role)
	}
	if !sess.IsAuthenticated() {
		t.Fatal("Login did not set session")
	}
}

func TestAuth_RejectsBadToken(t *testing.T) {
	b, _ := newTestAuth(t)
	_, err := b.Register("bob", "secret123", "ADMIN", "WRONG")
	if err == nil {
		t.Fatal("expected error for wrong registration token")
	}
}
