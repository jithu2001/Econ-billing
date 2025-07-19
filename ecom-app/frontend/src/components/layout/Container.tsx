import React from 'react';
import { spacing, breakpoints } from '../../theme';

export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const getMaxWidth = (maxWidth: ContainerProps['maxWidth']) => {
  const widths = {
    sm: breakpoints.sm,
    md: breakpoints.md,
    lg: breakpoints.lg,
    xl: breakpoints.xl,
    '2xl': breakpoints['2xl'],
    full: '100%',
  };
  return widths[maxWidth || 'xl'];
};

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = true,
  style,
  className,
}) => {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: getMaxWidth(maxWidth),
    margin: '0 auto',
    padding: padding ? `0 ${spacing[4]}` : '0',
    ...style,
  };

  return (
    <div style={containerStyle} className={className}>
      {children}
    </div>
  );
};