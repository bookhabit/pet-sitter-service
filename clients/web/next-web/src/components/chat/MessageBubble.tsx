'use client';

import { cn, Flex, Text } from '@/design-system';

import type { ChatMessage } from '@/schemas/chat.schema';

interface Props {
  message: ChatMessage;
  /** true이면 본인이 보낸 메시지 (우측 정렬, 파란 배경) */
  isMe: boolean;
}

/**
 * [View] 개별 채팅 메시지 버블
 *
 * - 본인 메시지: 우측 정렬, 파란 배경, 흰 글씨
 * - 상대 메시지: 좌측 정렬, 회색 배경, 기본 글씨
 */
export function MessageBubble({ message, isMe }: Props) {
  const timeLabel = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(message.createdAt);

  return (
    <Flex justify={isMe ? 'end' : 'start'}>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-12 py-8',
          isMe ? 'rounded-br-[0.4rem] bg-[var(--blue500)]' : 'rounded-bl-[0.4rem] bg-grey100',
        )}
      >
        <Text size="b2" color={isMe ? 'white' : 'primary'} className="leading-relaxed">
          {message.content}
        </Text>
        <Text
          size="b2"
          color={isMe ? 'white' : 'secondary'}
          className={cn('mt-4 text-right text-[1rem]', isMe && 'opacity-70')}
        >
          {timeLabel}
        </Text>
      </div>
    </Flex>
  );
}
