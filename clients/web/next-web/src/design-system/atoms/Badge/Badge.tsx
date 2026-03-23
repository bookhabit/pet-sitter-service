'use client';

import type { ReactNode } from 'react';

import { cn } from '../../utils/cn';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary text-white',
  success: 'bg-success text-white',
  warning: 'bg-warning text-grey900',
  danger: 'bg-danger text-white',
  neutral: 'bg-background text-text-secondary',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-8 py-4 text-caption rounded-md',
  md: 'px-12 py-8 text-b2 rounded-lg',
};

export function Badge({ variant = 'neutral', size = 'md', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center font-bold', variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  );
}
