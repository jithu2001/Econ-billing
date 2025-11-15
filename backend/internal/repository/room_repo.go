package repository

import (
	"database/sql"
	"hotel-mgmt/internal/models"
)

func CreateRoom(db *sql.DB, req models.CreateRoomRequest) (int64, error) {
	stmt, err := db.Prepare(`
		INSERT INTO rooms (property_id, room_number, tag_id, price, status, description)
		VALUES (?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(req.PropertyID, req.RoomNumber, req.TagID, req.Price, req.Status, req.Description)
	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return id, nil
}

func ListRooms(db *sql.DB, propertyID int64) ([]models.RoomResponse, error) {
	rows, err := db.Query(`
		SELECT r.id, r.property_id, r.room_number, r.tag_id, r.price, r.status, r.description, r.created_at, t.name
		FROM rooms r
		LEFT JOIN room_tags t ON r.tag_id = t.id
		WHERE r.property_id = ?
		ORDER BY r.room_number
	`, propertyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rooms := []models.RoomResponse{}

	for rows.Next() {
		var r models.RoomResponse
		var tagName sql.NullString
		err := rows.Scan(&r.ID, &r.PropertyID, &r.RoomNumber, &r.TagID, &r.Price, &r.Status, &r.Description, &r.CreatedAt, &tagName)
		if err != nil {
			return nil, err
		}
		if tagName.Valid {
			r.TagName = &tagName.String
		}
		rooms = append(rooms, r)
	}

	return rooms, rows.Err()
}

func UpdateRoom(db *sql.DB, roomID int64, req models.UpdateRoomRequest) error {
	stmt, err := db.Prepare(`
		UPDATE rooms SET room_number = ?, tag_id = ?, price = ?, status = ?, description = ?
		WHERE id = ?
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(req.RoomNumber, req.TagID, req.Price, req.Status, req.Description, roomID)
	return err
}

func DeleteRoom(db *sql.DB, roomID int64) error {
	_, err := db.Exec("DELETE FROM rooms WHERE id = ?", roomID)
	return err
}
