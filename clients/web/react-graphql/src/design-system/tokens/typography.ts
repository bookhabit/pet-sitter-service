/**
 * Typography Scale
 * 폰트 크기 + 행간 + 자간 + 자중을 하나의 단위로 관리합니다.
 * Tailwind의 text-t1, text-b1 클래스와 1:1 대응합니다.
 */
export const typography = {
  t1: { fontSize: '2.4rem', lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' },
  t2: { fontSize: '2.0rem', lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' },
  b1: { fontSize: '1.6rem', lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' },
  b2: { fontSize: '1.4rem', lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' },
  caption: { fontSize: '1.2rem', lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' },
} as const;

export type TypographySize = keyof typeof typography;
