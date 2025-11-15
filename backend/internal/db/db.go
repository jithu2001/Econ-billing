package db

import (
    "database/sql"
    "log"
    "os"

    _ "modernc.org/sqlite"
)

func Init() *sql.DB {
    os.MkdirAll("data", 0755)

    db, err := sql.Open("sqlite", "data/app.db")
    if err != nil {
        log.Fatal(err)
    }

    _, err = db.Exec("PRAGMA foreign_keys = ON;")
    if err != nil {
        log.Fatal("Failed enabling FKs:", err)
    }

    return db
}
