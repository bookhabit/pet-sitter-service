import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../utils/cn';

type GridCols = 1 | 2 | 3 | 4 | 6 | 12;

interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** 열 개수 */
  cols?: GridCols;
  /**
   * 그리드 간격 (px 단위, 8px grid 기반)
   * @example gap={16} → gap: 1.6rem
   */
  gap?: number;
  children: ReactNode;
}

const colClasses: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

export function Grid({ cols = 1, gap, className, children, style, ...props }: GridProps) {
  return (
    <div
      className={cn('grid', colClasses[cols], className)}
      style={{ gap: gap !== undefined ? `${gap / 10}rem` : undefined, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
