import { useCallback, useEffect } from 'react';
import { useSuspenseQuery, useApolloClient } from '@apollo/client';

import { useAuthStore } from '@/store/useAuthStore';
import { useChatSocketStore } from '@/store/useChatSocketStore';
import { GET_CHAT_ROOMS, GET_MESSAGES } from '@/graphql/queries/chat';

import type { ChatRoom, PaginatedMessages } from '@/schemas/chat.schema';

/* ─── GraphQL Query ──────────────────────────────────────────── */

/**
 * [Data Hook] GET /chat-rooms — 내 채팅방 목록
 */
export function useChatRoomsQuery() {
  const { data } = useSuspenseQuery<{ chatRooms: ChatRoom[] }>(GET_CHAT_ROOMS);
  return { data: data?.chatRooms ?? [] };
}

/* ─── Cache Refresh ──────────────────────────────────────────── */

/**
 * 채팅방 목록 캐시 강제 갱신 (messagesRead 이벤트 수신 후 호출)
 * unreadCount 업데이트에 사용
 */
export function useRefreshChatRooms() {
  const client = useApolloClient();
  return useCallback(() => {
    client.refetchQueries({ include: ['GetChatRooms'] });
  }, [client]);
}

/* ─── Global Notification Sync ──────────────────────────────── */

/**
 * 레이아웃에 한 번 마운트.
 * - 인증 상태에서 소켓 전역 연결 유지
 * - 채팅방 밖에서 받은 newMessageNotification 시 채팅방 목록 갱신
 */
export function useGlobalChatNotifications() {
  const client = useApolloClient();
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
    client.refetchQueries({ include: ['GetChatRooms'] });
    clearPendingNotifications();
  }, [pendingNotificationRoomIds, client, clearPendingNotifications]);
}

/* ─── Infinite Scroll (메시지 더 보기) ───────────────────────── */

/**
 * 채팅방의 이전 메시지 로드 (무한스크롤)
 * IntersectionObserver sentinel에서 호출
 */
export function useLoadMoreMessages(chatRoomId: string) {
  const client = useApolloClient();
  const { hasMore, isLoadingMore, nextCursor, prependMessages, setLoadingMore } =
    useChatSocketStore();

  return useCallback(async () => {
    if (!hasMore[chatRoomId] || isLoadingMore[chatRoomId]) return;

    setLoadingMore(chatRoomId, true);
    try {
      const result = await client.query<{ messages: PaginatedMessages }>({
        query: GET_MESSAGES,
        variables: {
          chatRoomId,
          cursor: nextCursor[chatRoomId] ?? undefined,
          limit: 30,
        },
        fetchPolicy: 'network-only',
      });
      const { messages, nextCursor: newCursor } = result.data.messages;
      prependMessages(chatRoomId, messages, newCursor);
    } finally {
      setLoadingMore(chatRoomId, false);
    }
  }, [chatRoomId, client, hasMore, isLoadingMore, nextCursor, prependMessages, setLoadingMore]);
}
