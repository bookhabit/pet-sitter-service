import { useCallback, useEffect } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/store/useAuthStore';

import { chatService } from '@/services/chat.service';
import { useChatSocketStore } from '@/store/useChatSocketStore';

/* ─── Query Keys ─────────────────────────────────────────────── */

export const chatQueryKeys = {
  rooms: () => ['chat-rooms'] as const,
};

/* ─── REST Query ─────────────────────────────────────────────── */

/**
 * [Data Hook] GET /chat-rooms — 내 채팅방 목록
 */
export function useChatRoomsQuery() {
  return useSuspenseQuery({
    queryKey: chatQueryKeys.rooms(),
    queryFn: () => chatService.getChatRooms(),
    staleTime: 1000 * 60 * 1,
  });
}

/* ─── Cache Refresh ──────────────────────────────────────────── */

/**
 * 채팅방 목록 캐시 강제 갱신 (messagesRead 이벤트 수신 후 호출)
 * unreadCount 업데이트에 사용
 */
export function useRefreshChatRooms() {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
  }, [queryClient]);
}

/* ─── Global Notification Sync ──────────────────────────────── */

/**
 * 레이아웃에 한 번 마운트.
 * - 인증 상태에서 소켓 전역 연결 유지
 * - 채팅방 밖에서 받은 newMessageNotification 시 채팅방 목록 갱신
 */
export function useGlobalChatNotifications() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const { connect, pendingNotificationRoomIds, clearPendingNotifications } =
    useChatSocketStore();

  // 인증된 상태에서 소켓 전역 연결 (이미 연결돼 있으면 connect() 내부에서 early return)
  useEffect(() => {
    if (!token) return;
    connect(token);
  }, [token, connect]);

  // 채팅방 밖 알림 수신 시 채팅방 목록 캐시 갱신
  useEffect(() => {
    if (pendingNotificationRoomIds.length === 0) return;
    queryClient.invalidateQueries({ queryKey: chatQueryKeys.rooms() });
    clearPendingNotifications();
  }, [pendingNotificationRoomIds, queryClient, clearPendingNotifications]);
}

/* ─── Infinite Scroll (메시지 더 보기) ───────────────────────── */

/**
 * 채팅방의 이전 메시지 로드 (무한스크롤)
 * IntersectionObserver sentinel에서 호출
 */
export function useLoadMoreMessages(chatRoomId: string) {
  const { hasMore, isLoadingMore, nextCursor, prependMessages, setLoadingMore } =
    useChatSocketStore();

  return useCallback(async () => {
    if (!hasMore[chatRoomId] || isLoadingMore[chatRoomId]) return;

    setLoadingMore(chatRoomId, true);
    try {
      const result = await chatService.getMessages(chatRoomId, {
        cursor: nextCursor[chatRoomId] ?? undefined,
        limit: 30,
      });
      prependMessages(chatRoomId, result.messages, result.nextCursor);
    } finally {
      setLoadingMore(chatRoomId, false);
    }
  }, [chatRoomId, hasMore, isLoadingMore, nextCursor, prependMessages, setLoadingMore]);
}
