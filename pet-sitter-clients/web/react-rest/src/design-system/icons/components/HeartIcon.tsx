import type { IconProps } from '../types';
export function HeartIcon({ size = 24, color = 'currentColor', className, ...props }: IconProps) {
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
      <g clipPath="url(#HeartIcon_svg__a)">
        <path
          fill={color}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.667}
          d="M15.832 11.666c1.242-1.216 2.5-2.675 2.5-4.583A4.583 4.583 0 0 0 13.75 2.5c-1.466 0-2.5.417-3.75 1.667C8.75 2.917 7.716 2.5 6.25 2.5a4.583 4.583 0 0 0-4.582 4.583c0 1.917 1.25 3.375 2.5 4.583L9.998 17.5z"
        />
      </g>
      <defs>
        <clipPath id="HeartIcon_svg__a">
          <path fill="#fff" d="M0 0h19.999v19.999H0z" />
        </clipPath>
      </defs>
    </svg>
  );
}
