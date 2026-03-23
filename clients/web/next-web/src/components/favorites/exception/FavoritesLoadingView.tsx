'use client';

import { Flex, Skeleton, Spacing } from '@/design-system';

/**
 * [Loading] 즐겨찾기 목록 스켈레톤 UI
 */
export function FavoritesLoadingView() {
  return (
    <Flex direction="column" gap={12} className="p-16">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-grey200 bg-white p-16">
          <Skeleton height={24} rounded="lg" className="mb-8 w-3/4" />
          <Skeleton height={18} rounded="lg" className="mb-4 w-1/2" />
          <Skeleton height={18} rounded="lg" className="w-1/3" />
          <Spacing size={12} />
          <Flex gap={8}>
            <Skeleton width={64} height={24} rounded="md" />
            <Skeleton width={80} height={24} rounded="md" />
          </Flex>
        </div>
      ))}
    </Flex>
  );
}
