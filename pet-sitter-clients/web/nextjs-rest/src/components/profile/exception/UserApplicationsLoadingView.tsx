'use client';

import { Flex, Skeleton } from '@/design-system';

/**
 * [Loading] PetSitter 지원 공고 목록 로딩 스켈레톤
 */
export function UserApplicationsLoadingView() {
  return (
    <Flex direction="column" gap={12} className="py-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-grey200 bg-white p-16">
          <Flex justify="between" align="center">
            <Skeleton height={18} rounded="lg" className="w-1/2" />
            <Skeleton width={64} height={24} rounded="md" />
          </Flex>
        </div>
      ))}
    </Flex>
  );
}
