import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLoadMoreMessages, useRefreshChatRooms } from '@/hooks/chat';
import { chatService } from '@/services/chat.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatSocketStore } from '@/store/useChatSocketStore';

import { ChatRoomView } from './ChatRoomView';

interface Props {
  /** URL 파라미터에서 전달받은 채팅방 ID */
  roomId: string;
  /** location.state 또는 ChatRoomByApplicationPage에서 전달받은 jobApplicationId — joinRoom emit에 필요 */
  jobApplicationId: string | undefined;
}

/**
 * [Container] 채팅방 소켓 연결 + 데이터 로직 담당
 *
 * 책임:
 *   - 소켓 connect → joinRoom → 초기 메시지 HTTP 로드
 *   - 탭 Visibility 처리 (숨김 시 disconnect, 복귀 시 reconnect)
 *   - IntersectionObserver sentinel을 통한 이전 메시지 무한스크롤
 *   - 메시지 전송 (sendMessage emit)
 *   - ChatRoomView에 모든 상태 + 핸들러 전달
 *
 * 절대 금지: JSX 스타일링 로직, 화면 구성 결정
 */
export function ChatRoomContainer({ roomId, jobApplicationId }: Props) {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const {
    disconnect,
    connect,
    joinRoom,
    sendMessage,
    initMessages,
    messages,
    isLoadingMore,
    currentJobApplicationId,
  } = useChatSocketStore();

  const refreshChatRooms = useRefreshChatRooms();
  const loadMore = useLoadMoreMessages(roomId);

  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const roomMessages = messages[roomId] ?? [];

  /* ── 1. 초기 메시지 HTTP 로드 (소켓 연결/joinRoom은 Page에서 담당) ── */
  useEffect(() => {
    if (!roomId) return;

    const fetchInitialMessages = async () => {
      const result = await chatService.getMessages(roomId, { limit: 30 });
      // 서버는 최신→오래된 순으로 내려줌 → 화면 표시는 오래된→최신이므로 reverse
      initMessages(roomId, [...result.messages].reverse(), result.nextCursor);
    };

    void fetchInitialMessages();
    // cleanup에서 leaveRoom 금지 — Page(ChatRoomByApplicationPage)가 담당
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  /* ── 2. 새 메시지 도착 시 스크롤 최하단 이동 ─────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length]);

  /* ── 3. 탭 Visibility 처리 ──────────────────────────────────── */
  useEffect(() => {
    const handleVisibility = () => {
      if (!token) return;
      if (document.hidden) {
        disconnect();
      } else {
        connect(token);
        // 이전에 입장한 방이 있으면 재입장
        const prevJobApplicationId = currentJobApplicationId ?? jobApplicationId;
        if (prevJobApplicationId) {
          joinRoom(prevJobApplicationId);
        }
        refreshChatRooms();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, jobApplicationId]);

  /* ── 4. IntersectionObserver — 목록 최상단 sentinel ─────────── */
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  /* ── 5. 메시지 전송 ─────────────────────────────────────────── */
  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;
    sendMessage(roomId, text);
    setInputValue('');
  }, [inputValue, roomId, sendMessage]);

  const handleNavigateBack = () => {
    navigate('/chat');
  };

  if (!user) return null;

  return (
    <ChatRoomView
      messages={roomMessages}
      currentUserId={user.id}
      inputValue={inputValue}
      isLoadingMore={isLoadingMore[roomId] ?? false}
      onInputChange={setInputValue}
      onSend={handleSend}
      onNavigateBack={handleNavigateBack}
      sentinelRef={sentinelRef}
      bottomRef={bottomRef}
    />
  );
}
