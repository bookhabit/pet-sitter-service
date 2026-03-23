import { Badge, Flex, Text } from '@/design-system';

import type { ChatRoom } from '@/schemas/chat.schema';
import { formatDateTime } from '@/utils/format';

interface Props {
  rooms: ChatRoom[];
  onRoomClick: (room: ChatRoom) => void;
}

/**
 * [View] 채팅방 목록 표시
 *
 * 빈 배열 처리는 호출부(Container)의 EmptyBoundary에서 담당합니다.
 */
export function ChatRoomsList({ rooms, onRoomClick }: Props) {
  return (
    <Flex direction="column" gap={12} as="ul">
      {rooms.map((room) => {
        const lastMessage = room.messages?.[0];
        const hasUnread = room.unreadCount > 0;

        return (
          <li key={room.id}>
            <button
              type="button"
              onClick={() => onRoomClick(room)}
              className="hover:bg-grey50 w-full rounded-2xl border border-grey200 bg-white p-16 text-left transition-colors"
            >
              <Flex justify="between" align="center" gap={12}>
                <Flex direction="column" gap={4} className="min-w-0 flex-1">
                  <Text size="b1" className="font-semibold">
                    채팅방
                  </Text>
                  <Text
                    size="b2"
                    color="secondary"
                    className="overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {lastMessage?.content ?? '메시지가 없습니다.'}
                  </Text>
                  {lastMessage !== undefined && (
                    <Text size="b2" color="secondary">
                      {formatDateTime(lastMessage.createdAt)}
                    </Text>
                  )}
                </Flex>

                {hasUnread && (
                  <Badge variant="neutral" size="sm">
                    {room.unreadCount}
                  </Badge>
                )}
              </Flex>
            </button>
          </li>
        );
      })}
    </Flex>
  );
}
