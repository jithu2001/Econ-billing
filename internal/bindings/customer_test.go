// internal/bindings/customer_test.go
package bindings

import (
	"testing"

	"github.com/econ/econ/internal/repository"
	"github.com/econ/econ/internal/services"
	"github.com/econ/econ/internal/session"
	"github.com/google/uuid"
)

func TestCustomer_RequiresSession(t *testing.T) {
	db := openTestDB(t)
	sess := session.New()
	b := NewCustomerBinding(services.NewCustomerService(repository.NewCustomerRepository(db)), sess)
	if _, err := b.GetAll(); err == nil {
		t.Fatal("expected error when not authenticated")
	}
}

func TestCustomer_CRUD(t *testing.T) {
	db := openTestDB(t)
	sess := session.New()
	sess.Set(uuid.New())
	b := NewCustomerBinding(services.NewCustomerService(repository.NewCustomerRepository(db)), sess)

	c, err := b.Create(CustomerInput{FullName: "John", Phone: "555-1"})
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if c.FullName != "John" {
		t.Fatalf("got %q", c.FullName)
	}

	all, _ := b.GetAll()
	if len(all) != 1 {
		t.Fatalf("want 1 customer, got %d", len(all))
	}

	if _, err := b.Update(c.ID.String(), CustomerInput{FullName: "Jane", Phone: "555-2"}); err != nil {
		t.Fatal(err)
	}
	got, _ := b.GetByID(c.ID.String())
	if got.FullName != "Jane" {
		t.Fatalf("update did not persist")
	}

	if err := b.Delete(c.ID.String()); err != nil {
		t.Fatal(err)
	}
	all, _ = b.GetAll()
	if len(all) != 0 {
		t.Fatalf("delete did not remove customer")
	}
}
