import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../../tokens/colors';
import { Text } from '../Text';

type Variant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
type Size = 'sm' | 'md';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
}

const variantColors: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: '#e8f1fe', text: colors.primary },
  success: { bg: '#e6f9f1', text: colors.success },
  warning: { bg: '#fef7e6', text: colors.warning },
  danger: { bg: '#fef0ef', text: colors.danger },
  neutral: { bg: colors.background, text: colors.textSecondary },
};

export function Badge({ children, variant = 'neutral', size = 'md' }: Props) {
  const { bg, text } = variantColors[variant];
  return (
    <View style={[styles.base, styles[`size_${size}`], { backgroundColor: bg }]}>
      <Text size="caption" style={{ color: text, fontWeight: '500' }}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 4, alignSelf: 'flex-start' },
  size_sm: { paddingHorizontal: 6, paddingVertical: 2 },
  size_md: { paddingHorizontal: 8, paddingVertical: 4 },
});
