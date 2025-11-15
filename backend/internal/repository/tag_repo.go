package repository

import (
	"database/sql"
	"hotel-mgmt/internal/models"
)

func CreateTag(db *sql.DB, propertyID int64, name string) (int64, error) {
	stmt, err := db.Prepare(`
		INSERT INTO room_tags (property_id, name)
		VALUES (?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(propertyID, name)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func ListTags(db *sql.DB, propertyID int64) ([]models.Tag, error) {
	rows, err := db.Query(`
		SELECT id, property_id, name
		FROM room_tags
		WHERE property_id = ?
		ORDER BY name
	`, propertyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := []models.Tag{}

	for rows.Next() {
		var t models.Tag
		err := rows.Scan(&t.ID, &t.PropertyID, &t.Name)
		if err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}

	return tags, rows.Err()
}

func DeleteTag(db *sql.DB, tagID int64) error {
	_, err := db.Exec("DELETE FROM room_tags WHERE id = ?", tagID)
	return err
}
