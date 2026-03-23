'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/store/useAuthStore';
import { primitiveColors } from '@/design-system/tokens/colors';

/**
 * [GuestGuard] 인증된 사용자가 접근 시 /jobs로 리다이렉트
 * 비인증 사용자(게스트)만 접근 가능한 라우트 그룹 레이아웃
 */
export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/jobs');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: primitiveColors.grey100,
      }}
    >
      {children}
    </div>
  );
}
