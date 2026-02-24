import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../utils/cn';

type FlexDirection = 'row' | 'column';
type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

interface FlexProps extends HTMLAttributes<HTMLElement> {
  direction?: FlexDirection;
  justify?: FlexJustify;
  align?: FlexAlign;
  /**
   * 8px grid 기반 gap (px 단위로 입력)
   * @example gap={16} → gap: 1.6rem
   */
  gap?: number;
  wrap?: boolean;
  /** 렌더링할 HTML 태그 */
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'nav' | 'header' | 'footer' | 'ul' | 'ol' | 'li';
  children: ReactNode;
}

const directionClasses: Record<FlexDirection, string> = {
  row: '',
  column: 'flex-col',
};

const justifyClasses: Record<FlexJustify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

const alignClasses: Record<FlexAlign, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

export function Flex({
  direction = 'row',
  justify = 'start',
  align = 'center',
  gap,
  wrap = false,
  as: Tag = 'div',
  className,
  children,
  style,
  ...props
}: FlexProps) {
  return (
    <Tag
      className={cn(
        'flex',
        directionClasses[direction],
        justifyClasses[justify],
        alignClasses[align],
        wrap && 'flex-wrap',
        className,
      )}
      style={{ gap: gap !== undefined ? `${gap / 10}rem` : undefined, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}
