package db

import (
	"database/sql"
	"io/ioutil"
	"log"
)

func Migrate(db *sql.DB) {
	data, err := ioutil.ReadFile("schema.sql")
	if err != nil {
		log.Fatal("Cannot read schema.sql:", err)
	}

	_, err = db.Exec(string(data))
	if err != nil {
		log.Fatal("Migration error:", err)
	}

	log.Println("Database migrated successfully.")
}
