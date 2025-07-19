import React from 'react';
import { colors, spacing, borderRadius, typography, transitions } from '../../theme';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  className,
  ...props
}) => {
  const hasError = Boolean(error);
  
  const containerStyle: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    marginBottom: spacing[4],
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: typography.fontWeight.medium,
    color: colors.gray[700],
    marginBottom: spacing[2],
  };

  const inputWrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: `${spacing[3]} ${spacing[3]}`,
    paddingLeft: leftIcon ? spacing[10] : spacing[3],
    paddingRight: rightIcon ? spacing[10] : spacing[3],
    fontSize: '1rem',
    lineHeight: '1.5rem',
    color: colors.gray[900],
    backgroundColor: colors.white,
    border: `1px solid ${hasError ? colors.error[500] : colors.gray[300]}`,
    borderRadius: borderRadius.md,
    transition: transitions.default,
    outline: 'none',
    fontFamily: typography.fontFamily.sans.join(', '),
    ...style,
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.gray[400],
    pointerEvents: 'none',
    zIndex: 1,
  };

  const leftIconStyle: React.CSSProperties = {
    ...iconStyle,
    left: spacing[3],
  };

  const rightIconStyle: React.CSSProperties = {
    ...iconStyle,
    right: spacing[3],
  };

  const helperTextStyle: React.CSSProperties = {
    marginTop: spacing[1],
    fontSize: '0.875rem',
    color: hasError ? colors.error[600] : colors.gray[500],
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = hasError ? colors.error[500] : colors.primary[500];
    e.target.style.boxShadow = `0 0 0 3px ${hasError ? colors.error[200] : colors.primary[200]}`;
    if (props.onFocus) props.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = hasError ? colors.error[500] : colors.gray[300];
    e.target.style.boxShadow = 'none';
    if (props.onBlur) props.onBlur(e);
  };

  return (
    <div style={containerStyle}>
      {label && (
        <label style={labelStyle} htmlFor={props.id}>
          {label}
        </label>
      )}
      
      <div style={inputWrapperStyle}>
        {leftIcon && <div style={leftIconStyle}>{leftIcon}</div>}
        
        <input
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && <div style={rightIconStyle}>{rightIcon}</div>}
      </div>
      
      {(error || helperText) && (
        <div style={helperTextStyle}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};