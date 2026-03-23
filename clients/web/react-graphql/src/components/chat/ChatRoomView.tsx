import { type KeyboardEvent, type RefObject } from 'react';

import { Button, Flex, Spinner, Text } from '@/design-system';

import type { ChatMessage } from '@/schemas/chat.schema';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages: ChatMessage[];
  /** 현재 사용자 ID — 본인 메시지 판별에 사용 */
  currentUserId: string;
  /** 입력창 현재 값 */
  inputValue: string;
  /** 이전 메시지 로드 중 여부 (무한스크롤) */
  isLoadingMore: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onNavigateBack: () => void;
  /** 무한스크롤 sentinel ref — 목록 최상단에 배치 */
  sentinelRef: RefObject<HTMLDivElement | null>;
  /** 스크롤 최하단 anchor ref */
  bottomRef: RefObject<HTMLDivElement | null>;
}

/**
 * [View] 채팅방 화면 — 순수 UI 표현만 담당
 *
 * - 상단 헤더: 뒤로가기 버튼 + 타이틀
 * - 메시지 목록: MessageBubble 조합, 무한스크롤 sentinel 포함
 * - 하단 입력창: 텍스트 입력 + 전송 버튼
 */
export function ChatRoomView({
  messages,
  currentUserId,
  inputValue,
  isLoadingMore,
  onInputChange,
  onSend,
  onNavigateBack,
  sentinelRef,
  bottomRef,
}: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = inputValue.trim().length > 0;

  return (
    <Flex direction="column" align="stretch" className="mx-auto h-dvh w-full max-w-[90rem]">
      {/* 헤더 */}
      <div className="py-14 flex shrink-0 items-center gap-12 border-b border-grey200 bg-white px-24">
        <Button variant="ghost" size="sm" onClick={onNavigateBack}>
          ← 채팅 목록
        </Button>
        <Text size="b1" className="font-semibold">
          채팅방
        </Text>
      </div>

      {/* 메시지 목록 */}
      <div className="flex flex-1 flex-col gap-8 overflow-y-auto bg-background px-24 py-16">
        {/* 무한스크롤 sentinel — 목록 최상단 */}
        <div ref={sentinelRef} className="h-px" />

        {isLoadingMore && (
          <Flex justify="center" className="py-8">
            <Spinner size={20} />
          </Flex>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMe={message.sender_id === currentUserId}
          />
        ))}

        {/* 스크롤 최하단 anchor */}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="py-14 flex shrink-0 items-center gap-12 border-t border-grey200 bg-white px-24">
        <input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          className="py-10 flex-1 rounded-[2rem] border border-grey200 px-16 text-b2 outline-none focus:border-[var(--blue500)]"
        />
        <Button variant="primary" size="md" disabled={!canSend} onClick={onSend}>
          전송
        </Button>
      </div>
    </Flex>
  );
}
