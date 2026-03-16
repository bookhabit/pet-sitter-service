'use client';

import { Flex, Spacing, Text } from '@/design-system';

export function ChatRoomsEmptyView() {
  return (
    <Flex direction="column" align="center" className="py-64">
      <Text size="t2" color="secondary" className="text-center">
        참여 중인 채팅방이 없습니다.
      </Text>
      <Spacing size={8} />
      <Text size="b2" color="secondary" className="text-center">
        구인공고에 지원하거나 지원자에게 메시지를 보내면 채팅방이 생성됩니다.
      </Text>
    </Flex>
  );
}
