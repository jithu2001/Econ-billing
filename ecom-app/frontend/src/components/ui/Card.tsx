import React from 'react';
import { colors, spacing, borderRadius, shadows } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  padding?: keyof typeof spacing;
  shadow?: keyof typeof shadows;
  border?: boolean;
  hover?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = '6',
  shadow = 'base',
  border = true,
  hover = false,
  className,
  style,
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[padding as keyof typeof spacing],
    boxShadow: shadows[shadow as keyof typeof shadows],
    border: border ? `1px solid ${colors.gray[200]}` : 'none',
    transition: hover ? 'all 0.2s ease-in-out' : 'none',
    cursor: hover ? 'pointer' : 'default',
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover) {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = shadows.lg;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hover) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = shadows[shadow as keyof typeof shadows];
    }
  };

  return (
    <div
      style={cardStyle}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  style,
}) => {
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
    ...style,
  };

  const titleContainerStyle: React.CSSProperties = {
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: colors.gray[900],
    lineHeight: '1.75rem',
  };

  const subtitleStyle: React.CSSProperties = {
    margin: `${spacing[1]} 0 0 0`,
    fontSize: '0.875rem',
    color: colors.gray[600],
    lineHeight: '1.25rem',
  };

  return (
    <div style={headerStyle}>
      <div style={titleContainerStyle}>
        <h3 style={titleStyle}>{title}</h3>
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};