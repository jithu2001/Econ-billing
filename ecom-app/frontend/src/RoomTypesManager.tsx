import React, { useState, useEffect } from 'react';
import { RoomType } from './types';

const API_BASE = 'http://localhost:8080';

const RoomTypesManager: React.FC = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRoomTypes();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/room-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newTypeName.trim() })
      });

      if (response.ok) {
        setNewTypeName('');
        fetchRoomTypes();
        setMessage('Room type added successfully!');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('Error adding room type');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this room type?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/room-types/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchRoomTypes();
        setMessage('Room type deleted successfully!');
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('Error deleting room type');
    }
  };

  return (
    <div>
      <h3>Room Types</h3>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="Enter room type name (e.g., Deluxe, Standard)"
            style={{ padding: '8px', flex: 1 }}
            required
          />
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
            {loading ? 'Adding...' : 'Add Room Type'}
          </button>
        </div>
      </form>

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
        <h4>Existing Room Types</h4>
        {roomTypes.length === 0 ? (
          <p style={{ color: '#666' }}>No room types created yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {roomTypes.map((roomType) => (
              <div 
                key={roomType.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <span style={{ fontWeight: 'bold' }}>{roomType.name}</span>
                <button
                  onClick={() => handleDelete(roomType.id!)}
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

export default RoomTypesManager;