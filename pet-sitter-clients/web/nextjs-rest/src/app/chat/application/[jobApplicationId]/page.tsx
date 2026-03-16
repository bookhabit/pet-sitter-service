'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ChatRoomByApplicationPage } from '@/views/chat/ChatRoomByApplicationPage';

/**
 * 풀스크린 채팅방 — MainLayout(헤더/네비) 없이 단독 렌더링
 * AuthGuard 역할도 겸함 (인증 필요)
 */
export default function ChatRoomRoute() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <ChatRoomByApplicationPage />;
}
