'use client';

import { useRouter } from 'next/navigation';

import { Button, Flex, Spacing, Text } from '@/design-system';

/**
 * [Empty] 즐겨찾기한 공고 없음 안내 UI
 */
export function FavoritesEmptyView() {
  const router = useRouter();

  return (
    <Flex direction="column" align="center" className="py-64">
      <Text size="t2" color="secondary" className="text-center">
        즐겨찾기한 구인공고가 없습니다.
      </Text>
      <Spacing size={8} />
      <Text size="b2" color="secondary" className="text-center">
        마음에 드는 공고에 하트를 눌러보세요!
      </Text>
      <Spacing size={24} />
      <Button variant="secondary" size="sm" onClick={() => router.push('/jobs')}>
        구인공고 보러 가기
      </Button>
    </Flex>
  );
}
