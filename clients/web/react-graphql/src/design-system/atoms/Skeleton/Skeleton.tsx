import { cn } from '../../utils/cn';

type SkeletonRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  rounded?: SkeletonRounded;
  className?: string;
}

const roundedClasses: Record<SkeletonRounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export function Skeleton({ width, height, rounded = 'lg', className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-grey200', roundedClasses[rounded], className)}
      style={{
        width: typeof width === 'number' ? `${width / 10}rem` : width,
        height: typeof height === 'number' ? `${height / 10}rem` : height,
      }}
      aria-hidden="true"
    />
  );
}
