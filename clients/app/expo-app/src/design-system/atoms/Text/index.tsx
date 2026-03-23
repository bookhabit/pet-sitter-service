import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

import { colors, ColorKey } from '../../tokens/colors';
import { typography, TypographyKey } from '../../tokens/typography';

interface Props extends TextProps {
  size?: TypographyKey;
  color?: ColorKey;
}

// UI 역할만: props를 받아 스타일이 적용된 RNText를 렌더링
// 비즈니스 로직, 상태 관리 없음
export function Text({ size = 'b1', color = 'textPrimary', style, ...props }: Props) {
  return (
    <RNText
      style={[typography[size], { color: colors[color] }, style]}
      {...props}
    />
  );
}
