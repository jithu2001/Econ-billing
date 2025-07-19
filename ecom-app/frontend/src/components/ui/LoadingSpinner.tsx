import React from 'react';
import { colors, spacing } from '../../theme';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = colors.primary[600],
  message,
}) => {
  const sizeMap = {
    sm: '20px',
    md: '32px',
    lg: '48px',
  };

  const spinnerStyle: React.CSSProperties = {
    width: sizeMap[size],
    height: sizeMap[size],
    border: '3px solid transparent',
    borderTop: `3px solid ${color}`,
    borderRight: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
    padding: spacing[6],
  };

  const messageStyle: React.CSSProperties = {
    color: colors.gray[600],
    fontSize: '14px',
    fontWeight: '500',
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle} />
      {message && <div style={messageStyle}>{message}</div>}
    </div>
  );
};

// Add keyframes if not already added
if (!document.querySelector('#spinner-keyframes')) {
  const style = document.createElement('style');
  style.id = 'spinner-keyframes';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}