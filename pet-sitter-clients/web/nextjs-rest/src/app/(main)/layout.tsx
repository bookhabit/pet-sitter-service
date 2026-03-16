'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/useAuthStore';
import { MainLayout } from '@/layouts/MainLayout';

/**
 * [AuthGuard] 비인증 사용자가 접근 시 /login으로 리다이렉트
 * 인증된 사용자만 접근 가능한 라우트 그룹 레이아웃
 */
export default function MainGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <MainLayout>{children}</MainLayout>;
}
