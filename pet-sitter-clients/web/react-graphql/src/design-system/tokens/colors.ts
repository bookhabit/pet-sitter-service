/**
 * Primitive Tokens — CSS 변수의 실제 값 (참고용)
 * 컴포넌트 코드에서 직접 사용하지 말고 Semantic Tokens를 사용하세요.
 */
export const primitiveColors = {
  blue500: '#3182f6',
  grey900: '#191f28',
  grey600: '#4e5968',
  grey200: '#e5e8eb',
  grey100: '#f2f4f6',
  white: '#ffffff',
  green500: '#12b76a',
  orange400: '#f79009',
  red500: '#f04438',
} as const;

/**
 * Semantic Tokens — 역할(role) 기반 색상
 * 컴포넌트 코드에서 이 값을 참조하세요.
 */
export const semanticColors = {
  primary: 'var(--blue500)',
  background: 'var(--grey100)',
  textPrimary: 'var(--grey900)',
  textSecondary: 'var(--grey600)',
  success: 'var(--green500)',
  warning: 'var(--orange400)',
  danger: 'var(--red500)',
} as const;

export type PrimitiveColor = keyof typeof primitiveColors;
export type SemanticColor = keyof typeof semanticColors;
