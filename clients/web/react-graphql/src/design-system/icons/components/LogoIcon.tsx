import type { IconProps } from '../types';
export function LogoIcon({ size = 24, color = 'currentColor', className, ...props }: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={className}
    >
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.083}
        d="M9.167 5a1.667 1.667 0 1 0 0-3.333 1.667 1.667 0 0 0 0 3.333M15 8.333A1.667 1.667 0 1 0 15 5a1.667 1.667 0 0 0 0 3.333M16.667 15a1.667 1.667 0 1 0 0-3.333 1.667 1.667 0 0 0 0 3.333M7.5 8.333a4.167 4.167 0 0 1 4.167 4.167v2.917a2.917 2.917 0 0 1-5.7.87q-.534-1.72-2.25-2.254a2.917 2.917 0 0 1 .866-5.7z"
      />
    </svg>
  );
}
