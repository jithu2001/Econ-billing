import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { colors, spacing } from '../../theme';
import RoomTypesManager from '../../RoomTypesManager';
import RoomsManager from '../../RoomsManager';

export const ModernRoomsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'types' | 'rooms'>('types');

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: `${spacing[3]} ${spacing[6]}`,
    backgroundColor: isActive ? colors.primary[600] : colors.white,
    color: isActive ? colors.white : colors.gray[700],
    border: `1px solid ${isActive ? colors.primary[600] : colors.gray[300]}`,
    borderBottom: isActive ? `1px solid ${colors.primary[600]}` : '1px solid transparent',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    marginRight: spacing[1],
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
  });

  const tabContainerStyle: React.CSSProperties = {
    display: 'flex',
    borderBottom: `2px solid ${colors.gray[200]}`,
    marginBottom: spacing[6],
  };

  const contentStyle: React.CSSProperties = {
    minHeight: '500px',
    backgroundColor: colors.white,
    borderRadius: '0 8px 8px 8px',
    padding: spacing[6],
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: spacing[8] }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          color: colors.gray[900], 
          marginBottom: spacing[3],
          margin: 0,
        }}>
          🏠 Room Management
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: colors.gray[600], 
          margin: 0,
        }}>
          Manage your room types and individual room configurations.
        </p>
      </div>

      <Card>
        {/* Tabs */}
        <div style={tabContainerStyle}>
          <button
            style={tabButtonStyle(activeTab === 'types')}
            onClick={() => setActiveTab('types')}
            onMouseEnter={(e) => {
              if (activeTab !== 'types') {
                e.currentTarget.style.backgroundColor = colors.gray[50];
                e.currentTarget.style.borderColor = colors.gray[400];
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'types') {
                e.currentTarget.style.backgroundColor = colors.white;
                e.currentTarget.style.borderColor = colors.gray[300];
              }
            }}
          >
            🏷️ Room Types
          </button>
          <button
            style={tabButtonStyle(activeTab === 'rooms')}
            onClick={() => setActiveTab('rooms')}
            onMouseEnter={(e) => {
              if (activeTab !== 'rooms') {
                e.currentTarget.style.backgroundColor = colors.gray[50];
                e.currentTarget.style.borderColor = colors.gray[400];
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'rooms') {
                e.currentTarget.style.backgroundColor = colors.white;
                e.currentTarget.style.borderColor = colors.gray[300];
              }
            }}
          >
            🚪 Rooms
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {activeTab === 'types' && (
            <div>
              <div style={{ marginBottom: spacing[6] }}>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: colors.gray[800], 
                  margin: `0 0 ${spacing[2]} 0`,
                }}>
                  Room Types Configuration
                </h3>
                <p style={{ 
                  color: colors.gray[600], 
                  margin: 0,
                  fontSize: '14px',
                }}>
                  Define different categories of rooms with their base pricing and features.
                </p>
              </div>
              <RoomTypesManager />
            </div>
          )}
          
          {activeTab === 'rooms' && (
            <div>
              <div style={{ marginBottom: spacing[6] }}>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: colors.gray[800], 
                  margin: `0 0 ${spacing[2]} 0`,
                }}>
                  Individual Rooms
                </h3>
                <p style={{ 
                  color: colors.gray[600], 
                  margin: 0,
                  fontSize: '14px',
                }}>
                  Manage specific room numbers and assign them to room types.
                </p>
              </div>
              <RoomsManager />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};