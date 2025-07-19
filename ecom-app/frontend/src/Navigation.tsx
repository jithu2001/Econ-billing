import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation: React.FC = () => {
  const location = useLocation();

  const linkStyle = (isActive: boolean) => ({
    padding: '10px 15px',
    backgroundColor: isActive ? '#007bff' : 'transparent',
    color: isActive ? 'white' : '#007bff',
    textDecoration: 'none',
    border: '1px solid #007bff',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'inline-block',
    marginRight: '10px'
  });

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={{ 
      padding: '20px 0', 
      borderBottom: '1px solid #dee2e6',
      marginBottom: '20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
        <h1 style={{ margin: '0 0 15px 0', color: '#333' }}>Ecom App</h1>
        <div>
          <Link
            to="/settings"
            style={linkStyle(isActive('/settings'))}
          >
            Business Settings
          </Link>
          <Link
            to="/rooms"
            style={linkStyle(isActive('/rooms'))}
          >
            Room Management
          </Link>
          <Link
            to="/customers"
            style={linkStyle(isActive('/customers'))}
          >
            Customer Management
          </Link>
          <Link
            to="/bookings"
            style={linkStyle(isActive('/bookings'))}
          >
            Room Reservations
          </Link>
          <Link
            to="/reports"
            style={linkStyle(isActive('/reports'))}
          >
            Rental Reports
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;