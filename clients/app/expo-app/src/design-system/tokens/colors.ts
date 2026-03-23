// web/react-rest 디자인 토큰과 동일한 값 — React Native StyleSheet용
export const colors = {
  primary: '#3182f6',
  textPrimary: '#191f28',
  textSecondary: '#4e5968',
  grey200: '#e5e8eb',
  background: '#f2f4f6',
  success: '#12b76a',
  warning: '#f79009',
  danger: '#f04438',
  white: '#ffffff',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof colors;
