'use client';

import type { SpacingToken } from '../tokens/spacing';

interface SpacingProps {
  /**
   * 간격 크기 (px 단위, 8px grid 기반)
   * 허용값: 2 | 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64
   */
  size: Exclude<SpacingToken, 0>;
  direction?: 'vertical' | 'horizontal';
}

/**
 * 컴포넌트 간 간격을 담당하는 레이아웃 컴포넌트.
 *
 * ### 핵심 규칙
 * - 컴포넌트는 스스로 외부 margin을 가지지 않습니다.
 * - 간격이 필요한 경우 항상 Spacing 컴포넌트를 사용합니다.
 *
 * @example
 * <Text>제목</Text>
 * <Spacing size={16} />
 * <Text size="b1">내용</Text>
 */
export function Spacing({ size, direction = 'vertical' }: SpacingProps) {
  const remValue = `${size / 10}rem`;
  const style =
    direction === 'vertical'
      ? { height: remValue, flexShrink: 0 as const }
      : { width: remValue, flexShrink: 0 as const };

  return <div style={style} aria-hidden="true" />;
}
