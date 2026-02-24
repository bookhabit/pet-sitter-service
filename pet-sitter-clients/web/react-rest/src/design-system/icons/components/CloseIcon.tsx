import type { IconProps } from '../types';
export function CloseIcon({ size = 24, color = 'currentColor', className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
    >
      <path stroke={color} strokeLinecap="round" strokeWidth={2} d="m6 6 12 12m0-12L6 18" />
    </svg>
  );
}
