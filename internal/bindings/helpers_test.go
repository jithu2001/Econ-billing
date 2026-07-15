// internal/bindings/helpers_test.go
package bindings

import (
	"testing"

	"github.com/econ/econ/internal/database"
	"gorm.io/gorm"
)

// openTestDB opens a throwaway SQLite DB in a temp dir and registers a cleanup
// that closes the connection BEFORE the TempDir RemoveAll runs. On Windows an
// open file handle blocks deletion, so closing first keeps cleanup green.
func openTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dir := t.TempDir()
	db, err := database.Open(dir + "/t.db")
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = database.Close(db) })
	return db
}
