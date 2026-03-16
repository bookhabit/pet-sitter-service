'use client';

import { Flex, Skeleton } from '@/design-system';

/**
 * [Loading] 지원자 목록 로딩 스켈레톤
 */
export function JobApplicationsLoadingView() {
  return (
    <Flex direction="column" gap={12} className="py-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-grey200 bg-white p-16">
          <Flex justify="between" align="center">
            <Skeleton height={18} rounded="lg" className="w-1/2" />
            <Flex gap={8}>
              <Skeleton width={56} height={32} rounded="lg" />
              <Skeleton width={56} height={32} rounded="lg" />
            </Flex>
          </Flex>
        </div>
      ))}
    </Flex>
  );
}
