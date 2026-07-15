package session

import (
	"testing"
	"github.com/google/uuid"
)

func TestSession_UnsetReturnsError(t *testing.T) {
	s := New()
	if _, err := s.UserID(); err == nil {
		t.Fatal("expected error for empty session, got nil")
	}
}

func TestSession_SetThenRead(t *testing.T) {
	s := New()
	id := uuid.New()
	s.Set(id)
	got, err := s.UserID()
	if err != nil {
		t.Fatal(err)
	}
	if got != id {
		t.Fatalf("want %s, got %s", id, got)
	}
}

func TestSession_Clear(t *testing.T) {
	s := New()
	s.Set(uuid.New())
	s.Clear()
	if _, err := s.UserID(); err == nil {
		t.Fatal("expected error after Clear")
	}
}
