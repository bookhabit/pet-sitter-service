import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { Controller } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Spacing, Text, TextInput, colors } from '@/design-system';
import { useLoginForm } from '@/hooks/useLoginForm';

// login.tsx: View 역할만 수행
// - 폼 상태와 로직은 useLoginForm에서 관리
// - 이 파일은 레이아웃 + 렌더링에만 집중
export default function LoginScreen() {
  const { control, errors, isLoading, onSubmit } = useLoginForm();

  return (
    // KeyboardAvoidingView: 키보드가 올라올 때 컨텐츠가 가려지지 않도록
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text size="t1">로그인</Text>
          <Spacing size={8} />
          <Text size="b1" color="textSecondary">
            펫시터 서비스에 오신 걸 환영합니다
          </Text>
        </View>

        <Spacing size={32} />

        {/* 이메일 필드 */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="이메일"
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Spacing size={16} />

        {/* 비밀번호 필드 */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="비밀번호"
              placeholder="비밀번호를 입력해주세요"
              secureTextEntry
              autoComplete="password"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        {/* 서버 에러 메시지 */}
        {errors.root && (
          <>
            <Spacing size={8} />
            <Text size="caption" color="danger">
              {errors.root.message}
            </Text>
          </>
        )}

        <Spacing size={24} />

        {/* 로그인 버튼 */}
        <Button onPress={onSubmit} isLoading={isLoading}>
          로그인
        </Button>

        <Spacing size={16} />

        {/* 회원가입 링크 */}
        <View style={styles.linkRow}>
          <Text size="b2" color="textSecondary">
            계정이 없으신가요?{' '}
          </Text>
          <Link href="/(auth)/register" asChild>
            <Text size="b2" style={{ color: colors.primary, fontWeight: '600' }}>
              회원가입
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: { alignItems: 'flex-start' },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
