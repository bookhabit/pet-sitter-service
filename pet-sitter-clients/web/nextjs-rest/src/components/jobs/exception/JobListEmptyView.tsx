'use client';

import { Flex, Spacing, Text } from '@/design-system';

export default function JobListEmptyView() {
  return (
    <Flex direction="column" align="center" className="py-64">
      <Text size="t2" color="secondary" className="text-center">
        등록된 구인공고가 없습니다.
      </Text>
      <Spacing size={8} />
      <Text size="b2" color="secondary" className="text-center">
        첫 번째 구인공고를 등록해보세요!
      </Text>
    </Flex>
  );
}
