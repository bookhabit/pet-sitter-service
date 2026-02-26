import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useLoadMoreMessages, useRefreshChatRooms } from '@/hooks/chat';
import { chatService } from '@/services/chat.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatSocketStore } from '@/store/useChatSocketStore';

export function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const jobApplicationId = (location.state as { jobApplicationId?: string })?.jobApplicationId;

  const { token, user } = useAuthStore();
  const {
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    initMessages,
    messages,
    isLoadingMore,
    currentJobApplicationId,
  } = useChatSocketStore();
  const refreshChatRooms = useRefreshChatRooms();
  const loadMore = useLoadMoreMessages(roomId!);

  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const roomMessages = messages[roomId!] ?? [];

  /* ── 1. 소켓 연결 + 방 입장 + 초기 메시지 로드 ─────────────── */
  useEffect(() => {
    if (!roomId || !token || !jobApplicationId) return;

    const setup = async () => {
      connect(token);
      joinRoom(jobApplicationId);

      const result = await chatService.getMessages(roomId, { limit: 30 });
      // 서버는 최신→오래된 순으로 내려줌 → 화면 표시는 오래된→최신이므로 reverse
      initMessages(roomId, [...result.messages].reverse(), result.nextCursor);
    };

    setup();

    return () => {
      leaveRoom();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, token, jobApplicationId]);

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
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  /* ── 5. 메시지 전송 ─────────────────────────────────────────── */
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || !roomId) return;
    sendMessage(roomId, text);
    setInput('');
  }, [input, roomId, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        maxWidth: '60rem',
        margin: '0 auto',
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '1.2rem 2rem',
          borderBottom: '1px solid var(--grey200)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.2rem',
          backgroundColor: 'white',
        }}
      >
        <button
          onClick={() => navigate('/chat')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--blue500)',
            fontSize: '1.4rem',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          ← 채팅 목록
        </button>
        <p style={{ fontSize: '1.6rem', fontWeight: 600 }}>채팅방</p>
      </div>

      {/* 메시지 목록 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.6rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem',
        }}
      >
        {/* 무한스크롤 sentinel — 목록 최상단 */}
        <div ref={sentinelRef} style={{ height: '1px' }} />

        {isLoadingMore[roomId!] && (
          <p style={{ textAlign: 'center', fontSize: '1.2rem', color: 'var(--grey400)' }}>
            불러오는 중...
          </p>
        )}

        {roomMessages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '0.8rem 1.2rem',
                  borderRadius: isMe ? '1.6rem 1.6rem 0.4rem 1.6rem' : '1.6rem 1.6rem 1.6rem 0.4rem',
                  backgroundColor: isMe ? 'var(--blue500)' : 'var(--grey100)',
                  color: isMe ? 'white' : 'var(--grey900)',
                  fontSize: '1.4rem',
                  lineHeight: 1.5,
                }}
              >
                <p>{msg.content}</p>
                <p
                  style={{
                    fontSize: '1rem',
                    color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--grey400)',
                    marginTop: '0.4rem',
                    textAlign: 'right',
                  }}
                >
                  {new Date(msg.createdAt).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}

        {/* 스크롤 최하단 anchor */}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div
        style={{
          padding: '1.2rem 2rem',
          borderTop: '1px solid var(--grey200)',
          display: 'flex',
          gap: '0.8rem',
          backgroundColor: 'white',
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          style={{
            flex: 1,
            padding: '0.8rem 1.2rem',
            borderRadius: '2rem',
            border: '1px solid var(--grey200)',
            fontSize: '1.4rem',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            padding: '0.8rem 1.6rem',
            borderRadius: '2rem',
            border: 'none',
            backgroundColor: input.trim() ? 'var(--blue500)' : 'var(--grey200)',
            color: input.trim() ? 'white' : 'var(--grey400)',
            fontSize: '1.4rem',
            fontWeight: 600,
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'background-color 0.15s',
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
}
