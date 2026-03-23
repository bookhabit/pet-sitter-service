'use client';

import { cn } from '../utils/cn';

interface DividerProps {
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * 영역 구분선 컴포넌트.
 * - horizontal: 가로 구분선 (기본값)
 * - vertical: 세로 구분선 (Flex 내부에서 사용)
 */
export function Divider({ direction = 'horizontal', className }: DividerProps) {
  if (direction === 'vertical') {
    return (
      <div
        className={cn('w-px self-stretch bg-grey200', className)}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return (
    <hr
      className={cn('border-0 border-t border-grey200', className)}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
