import React, { useState } from 'react';
import { Grid } from '../layout/Grid';
import { colors, spacing } from '../../theme';
import CustomerForm from '../../CustomerForm';
import CustomerList from '../../CustomerList';

export const ModernCustomersPage: React.FC = () => {
  const [refreshList, setRefreshList] = useState(false);

  const handleCustomerAdded = () => {
    setRefreshList(true);
  };

  const handleRefreshComplete = () => {
    setRefreshList(false);
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    borderRadius: '20px',
    padding: spacing[8],
    marginBottom: spacing[8],
    color: colors.white,
    position: 'relative',
    overflow: 'hidden',
  };

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
            👥 Customer Management
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            opacity: 0.9,
            margin: 0,
            fontWeight: '400',
          }}>
            Add new customers and manage your customer database with booking history
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <Grid cols={2} gap={8} style={{ alignItems: 'flex-start' }}>
        <div>
          <CustomerForm onCustomerAdded={handleCustomerAdded} />
        </div>
        
        <div>
          <CustomerList 
            refresh={refreshList} 
            onRefreshComplete={handleRefreshComplete} 
          />
        </div>
      </Grid>
    </div>
  );
};