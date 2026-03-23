import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, ViewStyle } from 'react-native';

import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { Text } from '../Text';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

// variant, size, loading 상태를 받아 스타일만 결정
// 클릭 이벤트 처리는 onPress prop으로 외부에 위임
export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
}: Props) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary}
        />
      ) : (
        <Text
          size={size === 'sm' ? 'b2' : 'b1'}
          style={[
            styles.label,
            variant === 'primary' || variant === 'danger'
              ? { color: colors.white }
              : { color: colors.primary },
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  // variant 스타일
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.grey200 },
  danger: { backgroundColor: colors.danger },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
  // size 스타일
  size_sm: { height: 36, paddingHorizontal: 12 },
  size_md: { height: 48, paddingHorizontal: 16 },
  size_lg: { height: 56, paddingHorizontal: 24 },
  // 상태 스타일
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  label: { ...typography.b1, fontWeight: '600' },
});
