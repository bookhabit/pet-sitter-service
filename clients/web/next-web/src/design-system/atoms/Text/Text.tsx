'use client';

import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/cn';

type TextSize = 't1' | 't2' | 'b1' | 'b2' | 'caption';
type TextColor = 'primary' | 'secondary' | 'white';

interface TextProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** 타이포그래피 스케일 */
  size?: TextSize;
  /** 텍스트 색상 (시맨틱 토큰 기반) */
  color?: TextColor;
  /** 렌더링할 HTML 태그 */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'label';
  children: ReactNode;
}

const sizeClasses: Record<TextSize, string> = {
  t1: 'text-t1',
  t2: 'text-t2',
  b1: 'text-b1',
  b2: 'text-b2',
  caption: 'text-caption',
};

const colorClasses: Record<TextColor, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  white: 'text-white',
};

export function Text({ size = 'b1', color = 'primary', as = 'p', className, children, ...props }: TextProps) {
  const Tag = as as ElementType;
  return (
    <Tag className={cn(sizeClasses[size], colorClasses[color], className)} {...props}>
      {children}
    </Tag>
  );
}
