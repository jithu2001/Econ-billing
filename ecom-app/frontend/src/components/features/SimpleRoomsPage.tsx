import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { colors, spacing } from '../../theme';
import { Grid } from '../layout/Grid';
import RoomTypesManager from '../../RoomTypesManager';
import RoomsManager from '../../RoomsManager';

export const SimpleRoomsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'types' | 'rooms'>('types');

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '20px',
    padding: spacing[8],
    marginBottom: spacing[8],
    color: colors.white,
    position: 'relative',
    overflow: 'hidden',
  };

  const getTabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: `${spacing[4]} ${spacing[6]}`,
    borderRadius: '12px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    background: isActive 
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
      : 'rgba(16, 185, 129, 0.1)',
    color: isActive ? colors.white : '#059669',
    boxShadow: isActive ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none',
    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
  });

  return (
    <div>
      {/* Enhanced Header */}
      <div style={headerStyle}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          zIndex: 1,
        }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            marginBottom: spacing[4],
            margin: 0,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          }}>
            🏠 Room Management
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            opacity: 0.9,
            margin: 0,
            fontWeight: '400',
          }}>
            Manage your room types and individual room configurations
          </p>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <Card padding={6} style={{ 
        marginBottom: spacing[6],
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: `2px solid ${colors.gray[100]}`,
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
      }}>
        <div style={{ 
          display: 'flex', 
          gap: spacing[3],
          marginBottom: spacing[6],
          justifyContent: 'center',
        }}>
          <button
            style={getTabButtonStyle(activeTab === 'types')}
            onClick={() => setActiveTab('types')}
          >
            🏷️ Room Types
          </button>
          <button
            style={getTabButtonStyle(activeTab === 'rooms')}
            onClick={() => setActiveTab('rooms')}
          >
            🚪 Individual Rooms
          </button>
        </div>

        <div style={{ 
          minHeight: '500px', 
          padding: spacing[6],
          background: colors.white,
          borderRadius: '16px',
          border: `1px solid ${colors.gray[100]}`,
        }}>
          {activeTab === 'types' && (
            <div>
              <div style={{ 
                marginBottom: spacing[6],
                textAlign: 'center',
                padding: spacing[6],
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '12px',
                border: `1px solid ${colors.gray[100]}`,
              }}>
                <h3 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  color: '#0369a1', 
                  margin: `0 0 ${spacing[2]} 0`,
                }}>
                  🏷️ Room Types Configuration
                </h3>
                <p style={{ 
                  color: '#0284c7', 
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '500',
                }}>
                  Define different categories of rooms with their base pricing and features
                </p>
              </div>
              <RoomTypesManager />
            </div>
          )}
          
          {activeTab === 'rooms' && (
            <div>
              <div style={{ 
                marginBottom: spacing[6],
                textAlign: 'center',
                padding: spacing[6],
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '12px',
                border: `1px solid ${colors.gray[100]}`,
              }}>
                <h3 style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  color: '#92400e', 
                  margin: `0 0 ${spacing[2]} 0`,
                }}>
                  🚪 Individual Rooms
                </h3>
                <p style={{ 
                  color: '#a16207', 
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '500',
                }}>
                  Manage specific room numbers and assign them to room types
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