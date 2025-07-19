import React, { useState, useEffect } from 'react';
import { Room, RoomType } from './types';

const API_BASE = 'http://localhost:8080';

const RoomsManager: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [newRoom, setNewRoom] = useState({ number: '', type_id: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rooms`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      setMessage('Error fetching rooms');
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/room-types`);
      if (response.ok) {
        const data = await response.json();
        setRoomTypes(data);
      }
    } catch (error) {
      setMessage('Error fetching room types');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRoom(prev => ({
      ...prev,
      [name]: name === 'type_id' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.number.trim() || newRoom.type_id === 0) return;
    
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRoom)
      });

      if (response.ok) {
        setNewRoom({ number: '', type_id: 0 });
        fetchRooms();
        setMessage('Room added successfully!');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('Error adding room');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/rooms/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchRooms();
        setMessage('Room deleted successfully!');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('Error deleting room');
    }
  };

  return (
    <div>
      <h3>Rooms</h3>
      
      {roomTypes.length === 0 ? (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Note:</strong> You need to create room types first before adding rooms.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              name="number"
              value={newRoom.number}
              onChange={handleInputChange}
              placeholder="Room number (e.g., 101, A1)"
              style={{ padding: '8px', minWidth: '150px' }}
              required
            />
            <select
              name="type_id"
              value={newRoom.type_id}
              onChange={handleInputChange}
              style={{ padding: '8px', minWidth: '150px' }}
              required
            >
              <option value={0}>Select room type</option>
              {roomTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: loading ? '#ccc' : '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Adding...' : 'Add Room'}
            </button>
          </div>
        </form>
      )}

      {message && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: message.includes('Error') ? '#f8d7da' : '#d4edda',
          color: message.includes('Error') ? '#721c24' : '#155724',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      <div>
        <h4>Existing Rooms</h4>
        {rooms.length === 0 ? (
          <p style={{ color: '#666' }}>No rooms created yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {rooms.map((room) => (
              <div 
                key={room.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Room {room.number}
                  </span>
                  <span style={{ 
                    marginLeft: '10px', 
                    padding: '2px 8px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {room.type_name}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(room.id!)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomsManager;