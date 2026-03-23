import type { IconProps } from '../types';
export function MessageCircleIcon({
  size = 24,
  color = 'currentColor',
  className,
  ...props
}: IconProps) {
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
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"
      />
    </svg>
  );
}
