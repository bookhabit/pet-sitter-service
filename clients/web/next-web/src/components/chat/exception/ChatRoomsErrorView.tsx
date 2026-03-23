'use client';

import { Button, Flex, Spacing, Text } from '@/design-system';

interface Props {
  error: Error;
  reset: () => void;
}

export function ChatRoomsErrorView({ error, reset }: Props) {
  return (
    <Flex direction="column" align="center" className="py-64">
      <Text size="t2" color="secondary">
        채팅방 목록을 불러오지 못했습니다.
      </Text>
      <Spacing size={8} />
      <Text size="b2" color="secondary">
        {error.message || '잠시 후 다시 시도해주세요.'}
      </Text>
      <Spacing size={24} />
      <Button variant="ghost" size="sm" onClick={reset}>
        다시 시도
      </Button>
    </Flex>
  );
}
