import { Stack } from 'expo-router';
import React from 'react';

import { colors } from '@/design-system';

// (auth) 그룹: 로그인 / 회원가입 화면
// 헤더 없는 스택 네비게이터
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    />
  );
}
