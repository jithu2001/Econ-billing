package database

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
)

type DB struct {
	*sql.DB
}

func New(host, port, user, password, dbname string) (*DB, error) {
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)
	
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		return nil, err
	}
	
	if err := db.Ping(); err != nil {
		return nil, err
	}
	
	return &DB{db}, nil
}