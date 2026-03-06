import { cn } from '../../utils/cn';

interface SpinnerProps {
  size?: number;
  color?: 'primary' | 'white';
  className?: string;
}

const colorClasses = {
  primary: 'border-primary',
  white: 'border-white',
} as const;

export function Spinner({ size = 20, color = 'primary', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={cn('animate-spin rounded-full border-2 border-t-transparent', colorClasses[color], className)}
      style={{ width: size, height: size, flexShrink: 0 }}
    />
  );
}
