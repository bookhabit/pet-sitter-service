import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

import { colors } from '../../tokens/colors';

type Rounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

const borderRadiusMap: Record<Rounded, number> = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 999,
};

interface Props {
  width: number | `${number}%`;
  height: number;
  rounded?: Rounded;
  style?: ViewStyle;
}

// 로딩 상태를 시각적으로 표현하는 Shimmer 애니메이션
// opacity 0.4 ↔ 1.0 사이를 반복하여 "빛나는" 효과
export function Skeleton({ width, height, rounded = 'md', style }: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Animated.loop: 애니메이션을 무한 반복
    // sequence: 두 애니메이션을 순서대로 실행 (어두워졌다 밝아지는 반복)
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadiusMap[rounded],
          backgroundColor: colors.grey200,
          opacity,
        },
        style,
      ]}
    />
  );
}
