import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { colors, spacing, shadows, borderRadius, typography, transitions } from '../../theme';
import { Container } from './Container';
import { Flex } from './Grid';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/settings', label: 'Business Settings', icon: '⚙️' },
  { path: '/rooms', label: 'Room Management', icon: '🏠' },
  { path: '/customers', label: 'Customer Management', icon: '👥' },
  { path: '/bookings', label: 'Room Reservations', icon: '📅' },
  { path: '/reports', label: 'Rental Reports', icon: '📊' },
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navStyle: React.CSSProperties = {
    backgroundColor: colors.white,
    borderBottom: `1px solid ${colors.gray[200]}`,
    boxShadow: shadows.sm,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  };

  const brandStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  };

  const navListStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[1],
    margin: 0,
    padding: 0,
    listStyle: 'none',
  };

  const mobileNavListStyle: React.CSSProperties = {
    ...navListStyle,
    flexDirection: 'column',
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTop: `1px solid ${colors.gray[200]}`,
    boxShadow: shadows.lg,
    padding: spacing[4],
    gap: spacing[2],
    display: isMobileMenuOpen ? 'flex' : 'none',
  };

  const getLinkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[3]} ${spacing[4]}`,
    borderRadius: borderRadius.lg,
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: typography.fontWeight.medium,
    transition: transitions.default,
    backgroundColor: active ? colors.primary[50] : 'transparent',
    color: active ? colors.primary[700] : colors.gray[600],
    border: active ? `1px solid ${colors.primary[200]}` : '1px solid transparent',
  });

  const mobileMenuButtonStyle: React.CSSProperties = {
    display: 'none',
    padding: spacing[2],
    backgroundColor: 'transparent',
    border: `1px solid ${colors.gray[300]}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    fontSize: '1.125rem',
  };


  // Add responsive styles to document head
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .desktop-nav { display: none !important; }
        .mobile-menu-button { display: block !important; }
      }
      @media (min-width: 769px) {
        .mobile-nav { display: none !important; }
        .mobile-menu-button { display: none !important; }
      }
      .nav-link {
        transition: all 0.2s ease-in-out !important;
      }
      .nav-link:hover {
        background-color: ${colors.gray[50]} !important;
        color: ${colors.gray[900]} !important;
      }
      .nav-link.active:hover {
        background-color: ${colors.primary[100]} !important;
        color: ${colors.primary[800]} !important;
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
        <Flex justify="space-between" align="center" style={{ minHeight: '64px', position: 'relative' }}>
          {/* Brand */}
          <Link to="/" style={brandStyle}>
            <span>🏨</span>
            <span>PropertyCare</span>
          </Link>

          {/* Desktop Navigation */}
          <ul style={navListStyle} className="desktop-nav">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    style={getLinkStyle(active)}
                    className={`nav-link ${active ? 'active' : ''}`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile Menu Button */}
          <button
            style={mobileMenuButtonStyle}
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          {/* Mobile Navigation */}
          <ul style={mobileNavListStyle} className="mobile-nav">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path} style={{ width: '100%' }}>
                  <Link
                    to={item.path}
                    style={{
                      ...getLinkStyle(active),
                      width: '100%',
                      justifyContent: 'flex-start',
                    }}
                    className={`nav-link ${active ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Flex>
      </Container>
    </nav>
  );
};