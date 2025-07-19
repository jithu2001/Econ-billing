import React from 'react';
import { colors, spacing } from '../../theme';

export const TestRoomsPage: React.FC = () => {
  return (
    <div>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: '700', 
        color: colors.gray[900], 
        marginBottom: spacing[3],
        margin: 0,
      }}>
        🏠 Room Management (Test)
      </h1>
      <p style={{ 
        fontSize: '1.125rem', 
        color: colors.gray[600], 
        margin: 0,
      }}>
        This is a test page to verify routing is working correctly.
      </p>
      
      <div style={{
        marginTop: spacing[8],
        padding: spacing[6],
        backgroundColor: colors.white,
        borderRadius: '8px',
        border: `1px solid ${colors.gray[200]}`,
      }}>
        <h2 style={{ color: colors.primary[600], marginBottom: spacing[4] }}>
          ✅ Room Management Page Loaded Successfully!
        </h2>
        <p style={{ color: colors.gray[700] }}>
          If you can see this message, the routing is working correctly and the component is loading.
        </p>
        <p style={{ color: colors.gray[600], fontSize: '14px', marginTop: spacing[4] }}>
          Current timestamp: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};