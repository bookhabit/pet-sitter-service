// web의 텍스트 스케일을 React Native fontSize로 이식
// web의 1rem = 10px 규칙을 RN fontSize 숫자로 직접 매핑
export const typography = {
  t1: { fontSize: 24, fontWeight: '700' as const, lineHeight: 31 },
  t2: { fontSize: 20, fontWeight: '700' as const, lineHeight: 26 },
  b1: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  b2: { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
} as const;

export type TypographyKey = keyof typeof typography;
