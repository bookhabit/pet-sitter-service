import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { useAuthStore } from '@/store/useAuthStore';

// QueryClient 설정
// throwOnError: true → query 에러가 ErrorBoundary로 자동 전파
// retry: 1 → 네트워크 오류 시 1번만 재시도
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      throwOnError: true,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 3, // 3분
    },
    mutations: {
      throwOnError: false, // mutation 에러는 onError 콜백에서 직접 처리 (토스트 등)
    },
  },
});

// AuthGuard: 인증 상태에 따라 라우팅을 제어
// - isHydrated가 false인 동안: 아무것도 렌더하지 않음 (토큰 복구 대기)
// - accessToken 없음 + auth 그룹 바깥: /login으로 리다이렉트
// - accessToken 있음 + auth 그룹: /(tabs)로 리다이렉트
function AuthGuard() {
  const { isHydrated, accessToken, hydrate } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // 앱 최초 실행 시 SecureStore에서 토큰 복구
  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return; // 초기화 전에는 아무 동작도 하지 않음

    const inAuthGroup = segments[0] === '(auth)';

    if (!accessToken && !inAuthGroup) {
      // 로그인 안 된 상태에서 보호된 화면 접근 → 로그인으로
      router.replace('/(auth)/login');
    } else if (accessToken && inAuthGroup) {
      // 이미 로그인된 상태에서 auth 화면 접근 → 홈으로
      router.replace('/(tabs)');
    }
  }, [isHydrated, accessToken, segments]);

  if (!isHydrated) return null; // 토큰 복구 완료 전 빈 화면

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <AuthGuard />
    </QueryClientProvider>
  );
}
