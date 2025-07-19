import React from 'react';
import { colors, spacing, borderRadius, typography } from '../../theme';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

const getVariantStyles = (variant: BadgeProps['variant']) => {
  const styles = {
    primary: {
      backgroundColor: colors.primary[100],
      color: colors.primary[800],
    },
    secondary: {
      backgroundColor: colors.gray[100],
      color: colors.gray[800],
    },
    success: {
      backgroundColor: colors.success[100],
      color: colors.success[700],
    },
    warning: {
      backgroundColor: colors.warning[100],
      color: colors.warning[600],
    },
    error: {
      backgroundColor: colors.error[100],
      color: colors.error[700],
    },
    info: {
      backgroundColor: colors.primary[50],
      color: colors.primary[700],
    },
  };
  return styles[variant || 'primary'];
};

const getSizeStyles = (size: BadgeProps['size']) => {
  const styles = {
    sm: {
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: '0.75rem',
      lineHeight: '1rem',
    },
    md: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
  };
  return styles[size || 'md'];
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typography.fontFamily.sans.join(', '),
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.full,
    whiteSpace: 'nowrap',
    ...sizeStyles,
    ...variantStyles,
    ...style,
  };

  return <span style={badgeStyle}>{children}</span>;
};