import { useCallback } from 'react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

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
