package database

import (
	"os"
	"path/filepath"
	"testing"
)

func TestResolveDBPath_UsesAPPDATA(t *testing.T) {
	tmp := t.TempDir()
	t.Setenv("APPDATA", tmp)
	p, err := ResolveDBPath()
	if err != nil {
		t.Fatal(err)
	}
	want := filepath.Join(tmp, "econ", "econ.db")
	if p != want {
		t.Fatalf("want %s, got %s", want, p)
	}
	// Parent dir must exist
	if _, err := os.Stat(filepath.Dir(p)); err != nil {
		t.Fatalf("parent dir not created: %v", err)
	}
}

func TestOpen_CreatesFileAndMigrates(t *testing.T) {
	tmp := t.TempDir()
	db, err := Open(filepath.Join(tmp, "test.db"))
	if err != nil {
		t.Fatal(err)
	}
	sqlDB, _ := db.DB()
	defer sqlDB.Close()
	if !db.Migrator().HasTable("users") {
		t.Fatal("users table not created by AutoMigrate")
	}
}
