// internal/bindings/settings_test.go
package bindings

import (
	"testing"

	"github.com/econ/econ/internal/repository"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
	"github.com/google/uuid"
)

func TestSettings_DefaultsThenSave(t *testing.T) {
	db := openTestDB(t)
	sess := session.New()
	sess.Set(uuid.New())
	b := NewSettingsBinding(services.NewSettingsService(repository.NewSettingsRepository(db)), sess)

	s, err := b.Get()
	if err != nil {
		t.Fatal(err)
	}
	if s.LodgeName != "My Lodge" {
		t.Fatalf("default LodgeName=%q want %q", s.LodgeName, "My Lodge")
	}
	saved, err := b.Save(SettingsInput{LodgeName: "Trinity", GSTInvoicePrefix: "GST", GSTInvoiceNextNumber: 1, NonGSTInvoicePrefix: "INV", NonGSTInvoiceNextNumber: 1})
	if err != nil {
		t.Fatal(err)
	}
	if saved.LodgeName != "Trinity" {
		t.Fatalf("save did not persist")
	}
}
