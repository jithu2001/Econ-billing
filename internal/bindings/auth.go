// internal/bindings/auth.go
package bindings

import (
	"errors"

	"github.com/econ/econ/internal/models"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
)

type LoginResult struct {
	User models.User `json:"user"`
}

type AuthBinding struct {
	svc               *services.AuthService
	sess              *session.Session
	registrationToken string
}

func NewAuthBinding(svc *services.AuthService, sess *session.Session, registrationToken string) *AuthBinding {
	return &AuthBinding{svc: svc, sess: sess, registrationToken: registrationToken}
}

func (b *AuthBinding) Login(username, password string) (*LoginResult, error) {
	user, err := b.svc.Login(username, password)
	if err != nil {
		return nil, err
	}
	b.sess.Set(user.ID)
	return &LoginResult{User: *user}, nil
}

func (b *AuthBinding) Register(username, password, role, registrationToken string) (*LoginResult, error) {
	if registrationToken != b.registrationToken {
		return nil, errors.New("invalid registration token")
	}
	r := models.RoleStaff
	if role == "ADMIN" {
		r = models.RoleAdmin
	}
	user, err := b.svc.Register(username, password, r)
	if err != nil {
		return nil, err
	}
	b.sess.Set(user.ID)
	return &LoginResult{User: *user}, nil
}

func (b *AuthBinding) Logout() error {
	b.sess.Clear()
	return nil
}

func (b *AuthBinding) CurrentUser() (*models.User, error) {
	uid, err := b.sess.UserID()
	if err != nil {
		return nil, err
	}
	return b.svc.GetUserByID(uid)
}

func (b *AuthBinding) IsAuthenticated() bool {
	return b.sess.IsAuthenticated()
}
