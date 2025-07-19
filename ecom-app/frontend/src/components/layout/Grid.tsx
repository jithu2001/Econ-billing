import React from 'react';
import { spacing } from '../../theme';

export interface GridProps {
  children: React.ReactNode;
  cols?: number | 'auto-fit' | 'auto-fill';
  gap?: keyof typeof spacing;
  minChildWidth?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 'auto-fit',
  gap = '6',
  minChildWidth = '250px',
  style,
  className,
}) => {
  const getGridTemplate = () => {
    if (typeof cols === 'number') {
      return `repeat(${cols}, 1fr)`;
    }
    return `repeat(${cols}, minmax(${minChildWidth}, 1fr))`;
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: getGridTemplate(),
    gap: spacing[gap as keyof typeof spacing],
    ...style,
  };

  return (
    <div style={gridStyle} className={className}>
      {children}
    </div>
  );
};

export interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: keyof typeof spacing;
  wrap?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = 'row',
  align = 'stretch',
  justify = 'flex-start',
  gap = '0',
  wrap = false,
  style,
  className,
}) => {
  const flexStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    gap: spacing[gap as keyof typeof spacing],
    flexWrap: wrap ? 'wrap' : 'nowrap',
    ...style,
  };

  return (
    <div style={flexStyle} className={className}>
      {children}
    </div>
  );
};