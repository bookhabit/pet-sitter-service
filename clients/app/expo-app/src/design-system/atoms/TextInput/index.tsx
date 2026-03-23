import React, { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { Text } from '../Text';

interface Props extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
}

// React Hook Form의 Controller와 함께 사용
// forwardRef: register("field") ref 전달을 위해 필요
export const TextInput = forwardRef<RNTextInput, Props>(
  ({ label, hint, error, style, ...props }, ref) => {
    return (
      <View style={styles.container}>
        {label && (
          <Text size="b2" style={styles.label}>
            {label}
          </Text>
        )}
        <RNTextInput
          ref={ref}
          style={[styles.input, error ? styles.inputError : styles.inputDefault, style]}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
        {error ? (
          <Text size="caption" color="danger" style={styles.message}>
            {error}
          </Text>
        ) : hint ? (
          <Text size="caption" color="textSecondary" style={styles.message}>
            {hint}
          </Text>
        ) : null}
      </View>
    );
  },
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  container: { gap: 4 },
  label: { fontWeight: '500' },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    ...typography.b1,
    color: colors.textPrimary,
  },
  inputDefault: { borderColor: colors.grey200, backgroundColor: colors.white },
  inputError: { borderColor: colors.danger, backgroundColor: colors.white },
  message: { paddingHorizontal: 4 },
});
