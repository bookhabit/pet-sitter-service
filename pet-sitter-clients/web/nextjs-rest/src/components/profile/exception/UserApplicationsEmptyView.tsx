'use client';

import { Flex, Spacing, Text } from '@/design-system';

/**
 * [Empty] PetSitter 지원 공고 없음 안내 UI
 */
export function UserApplicationsEmptyView() {
  return (
    <Flex direction="column" align="center" className="py-32">
      <Text size="b1" color="secondary" className="text-center">
        지원한 공고가 없습니다.
      </Text>
      <Spacing size={8} />
      <Text size="b2" color="secondary" className="text-center">
        구인공고에 지원하면 이곳에 표시됩니다.
      </Text>
    </Flex>
  );
}
