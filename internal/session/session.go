package session

import (
	"errors"
	"sync"

	"github.com/google/uuid"
)

var ErrNotAuthenticated = errors.New("not authenticated")

type Session struct {
	mu  sync.RWMutex
	uid uuid.UUID
}

func New() *Session {
	return &Session{}
}

func (s *Session) Set(id uuid.UUID) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.uid = id
}

func (s *Session) Clear() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.uid = uuid.Nil
}

func (s *Session) UserID() (uuid.UUID, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if s.uid == uuid.Nil {
		return uuid.Nil, ErrNotAuthenticated
	}
	return s.uid, nil
}

func (s *Session) IsAuthenticated() bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.uid != uuid.Nil
}
