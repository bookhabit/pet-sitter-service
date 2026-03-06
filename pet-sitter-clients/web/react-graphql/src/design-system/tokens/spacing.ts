/**
 * Spacing Tokens — 8px Grid 시스템
 * Tailwind의 spacing scale과 1:1 대응합니다.
 * 피그마 수치를 /10 하면 rem 값이 됩니다. (예: 24px → 2.4rem → p-24)
 */
export const spacingTokens = {
  0: '0',
  2: '0.2rem',
  4: '0.4rem',
  8: '0.8rem',
  12: '1.2rem',
  16: '1.6rem',
  24: '2.4rem',
  32: '3.2rem',
  48: '4.8rem',
  64: '6.4rem',
} as const;

export type SpacingToken = keyof typeof spacingTokens;
