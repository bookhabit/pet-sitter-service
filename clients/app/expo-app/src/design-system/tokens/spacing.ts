// 8px Grid 시스템 — 허용된 값 외 임의 숫자 사용 금지
export const spacing = {
  2: 2,
  4: 4,
  8: 8,
  12: 12,
  16: 16,
  24: 24,
  32: 32,
  48: 48,
  64: 64,
} as const;

export type SpacingKey = keyof typeof spacing;
