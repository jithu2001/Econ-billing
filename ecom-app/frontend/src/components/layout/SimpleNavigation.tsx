import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { colors, spacing, shadows, borderRadius } from '../../theme';
import { Container } from './Container';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/reports', label: 'Rental Reports', icon: '📊' },
  { path: '/rooms', label: 'Room Management', icon: '🏠' },
  { path: '/customers', label: 'Customer Management', icon: '👥' },
  { path: '/bookings', label: 'Room Reservations', icon: '📅' },
  { path: '/settings', label: 'Business Settings', icon: '⚙️' },
];

export const SimpleNavigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navStyle: React.CSSProperties = {
    backgroundColor: colors.white,
    borderBottom: `1px solid ${colors.gray[200]}`,
    boxShadow: shadows.lg,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  const brandStyle: React.CSSProperties = {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: colors.white,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    transition: 'transform 0.2s ease-in-out',
  };

  const navListStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    margin: 0,
    padding: 0,
    listStyle: 'none',
  };

  const getLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[3]} ${spacing[5]}`,
    borderRadius: borderRadius.xl,
    textDecoration: 'none',
    fontSize: '0.925rem',
    fontWeight: '600',
    backgroundColor: active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
    color: active ? colors.white : 'rgba(255, 255, 255, 0.9)',
    border: active ? `2px solid rgba(255, 255, 255, 0.3)` : '2px solid transparent',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: active ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: active ? '0 8px 25px rgba(0, 0, 0, 0.15)' : '0 2px 10px rgba(0, 0, 0, 0.1)',
  });

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '72px',
    padding: `${spacing[3]} 0`,
  };

  // Add enhanced CSS hover effects
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .simple-nav-link {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .simple-nav-link:hover {
        background-color: rgba(255, 255, 255, 0.2) !important;
        color: ${colors.white} !important;
        transform: translateY(-3px) !important;
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2) !important;
        border-color: rgba(255, 255, 255, 0.4) !important;
      }
      .simple-nav-link.active:hover {
        background-color: rgba(255, 255, 255, 0.35) !important;
        transform: translateY(-4px) !important;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25) !important;
      }
      .brand-hover:hover {
        transform: scale(1.05) !important;
      }
      .nav-icon {
        font-size: 1.1rem;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <nav style={navStyle}>
      <Container>
        <div style={containerStyle}>
          {/* Brand */}
          <Link to="/" style={brandStyle} className="brand-hover">
            <span style={{ fontSize: '2rem' }}>🏨</span>
            <span>PropertyCare</span>
          </Link>

          {/* Navigation Links */}
          <ul style={navListStyle}>
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    style={getLinkStyle(active)}
                    className={`simple-nav-link ${active ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </nav>
  );
};