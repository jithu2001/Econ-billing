import React from 'react';
import { colors, spacing, borderRadius, shadows, transitions, typography } from '../../theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const getVariantStyles = (variant: ButtonProps['variant']) => {
  const styles = {
    primary: {
      backgroundColor: colors.primary[600],
      color: colors.white,
      border: `1px solid ${colors.primary[600]}`,
      ':hover': {
        backgroundColor: colors.primary[700],
        borderColor: colors.primary[700],
      },
      ':focus': {
        boxShadow: `0 0 0 3px ${colors.primary[200]}`,
      },
      ':disabled': {
        backgroundColor: colors.gray[300],
        borderColor: colors.gray[300],
        color: colors.gray[500],
      },
    },
    secondary: {
      backgroundColor: colors.white,
      color: colors.gray[700],
      border: `1px solid ${colors.gray[300]}`,
      ':hover': {
        backgroundColor: colors.gray[50],
        borderColor: colors.gray[400],
      },
      ':focus': {
        boxShadow: `0 0 0 3px ${colors.gray[200]}`,
      },
    },
    success: {
      backgroundColor: colors.success[600],
      color: colors.white,
      border: `1px solid ${colors.success[600]}`,
      ':hover': {
        backgroundColor: colors.success[700],
      },
    },
    warning: {
      backgroundColor: colors.warning[500],
      color: colors.white,
      border: `1px solid ${colors.warning[500]}`,
      ':hover': {
        backgroundColor: colors.warning[600],
      },
    },
    error: {
      backgroundColor: colors.error[600],
      color: colors.white,
      border: `1px solid ${colors.error[600]}`,
      ':hover': {
        backgroundColor: colors.error[700],
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.gray[700],
      border: '1px solid transparent',
      ':hover': {
        backgroundColor: colors.gray[100],
      },
    },
  };
  return styles[variant || 'primary'];
};

const getSizeStyles = (size: ButtonProps['size']) => {
  const styles = {
    sm: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: '0.875rem',
      height: '32px',
    },
    md: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: '1rem',
      height: '40px',
    },
    lg: {
      padding: `${spacing[4]} ${spacing[6]}`,
      fontSize: '1.125rem',
      height: '48px',
    },
  };
  return styles[size || 'md'];
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  const getDisabledStyles = () => {
    if (!disabled && !isLoading) return {};
    return {
      backgroundColor: colors.gray[300],
      borderColor: colors.gray[300],
      color: colors.gray[500],
      cursor: 'not-allowed',
    };
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    fontFamily: typography.fontFamily.sans.join(', '),
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.md,
    transition: transitions.default,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    outline: 'none',
    position: 'relative',
    width: fullWidth ? '100%' : 'auto',
    ...sizeStyles,
    ...variantStyles,
    ...getDisabledStyles(),
    ...style,
  };

  return (
    <button
      style={buttonStyle}
      disabled={disabled || isLoading}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          if (variant === 'primary') {
            e.currentTarget.style.backgroundColor = colors.primary[700];
            e.currentTarget.style.borderColor = colors.primary[700];
          } else if (variant === 'secondary') {
            e.currentTarget.style.backgroundColor = colors.gray[50];
            e.currentTarget.style.borderColor = colors.gray[400];
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.backgroundColor = variantStyles.backgroundColor;
          e.currentTarget.style.borderColor = variantStyles.border?.split(' ')[2] || 'transparent';
        }
      }}
      onFocus={(e) => {
        if (!disabled && !isLoading) {
          if (variant === 'primary') {
            e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[200]}`;
          }
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...props}
    >
      {isLoading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid',
            borderColor: `transparent ${colors.white} ${colors.white} ${colors.white}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      <span style={{ opacity: isLoading ? 0.7 : 1 }}>{children}</span>
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};

// Add keyframes for loading spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);