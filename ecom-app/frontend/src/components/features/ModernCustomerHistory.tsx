import React from 'react';
import { colors, spacing } from '../../theme';
import CustomerHistory from '../../CustomerHistory';

export const ModernCustomerHistory: React.FC = () => {
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
          📈 Customer History
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: colors.gray[600], 
          margin: 0,
        }}>
          View detailed booking history and customer activity.
        </p>
      </div>

      {/* Content */}
      <div style={{
        backgroundColor: colors.white,
        borderRadius: '8px',
        padding: spacing[6],
        border: `1px solid ${colors.gray[200]}`,
      }}>
        <CustomerHistory />
      </div>
    </div>
  );
};