import React from 'react';
import { View } from 'react-native';

import { SpacingKey, spacing } from '../tokens/spacing';

interface Props {
  size: SpacingKey;
  direction?: 'vertical' | 'horizontal';
}

// 컴포넌트 간 간격을 담당하는 레이아웃 전용 컴포넌트
// 컴포넌트 자체에 margin을 주지 않고 Spacing이 간격을 소유
export function Spacing({ size, direction = 'vertical' }: Props) {
  const value = spacing[size];
  return (
    <View
      style={
        direction === 'vertical' ? { height: value } : { width: value }
      }
    />
  );
}
