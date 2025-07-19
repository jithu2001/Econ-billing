import React, { useState } from 'react';
import RoomTypesManager from './RoomTypesManager';
import RoomsManager from './RoomsManager';

const RoomsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'types' | 'rooms'>('types');

  const tabStyle = (isActive: boolean) => ({
    padding: '10px 20px',
    backgroundColor: isActive ? '#007bff' : '#f8f9fa',
    color: isActive ? 'white' : '#495057',
    border: '1px solid #dee2e6',
    borderBottom: isActive ? '1px solid #007bff' : '1px solid #dee2e6',
    cursor: 'pointer',
    borderRadius: '4px 4px 0 0',
    marginRight: '2px'
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Room Management</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6' }}>
          <button
            style={tabStyle(activeTab === 'types')}
            onClick={() => setActiveTab('types')}
          >
            Room Types
          </button>
          <button
            style={tabStyle(activeTab === 'rooms')}
            onClick={() => setActiveTab('rooms')}
          >
            Rooms
          </button>
        </div>
      </div>

      <div style={{ 
        minHeight: '400px',
        padding: '20px',
        border: '1px solid #dee2e6',
        borderTop: 'none',
        borderRadius: '0 4px 4px 4px',
        backgroundColor: 'white'
      }}>
        {activeTab === 'types' && <RoomTypesManager />}
        {activeTab === 'rooms' && <RoomsManager />}
      </div>
    </div>
  );
};

export default RoomsPage;