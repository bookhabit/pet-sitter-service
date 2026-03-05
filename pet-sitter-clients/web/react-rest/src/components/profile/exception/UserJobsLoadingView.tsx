import { Flex, Skeleton, Spacing } from '@/design-system';

/**
 * [Loading] PetOwner 등록 공고 목록 로딩 스켈레톤
 */
export function UserJobsLoadingView() {
  return (
    <Flex direction="column" gap={12} className="py-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-grey200 bg-white p-16">
          <Skeleton height={22} rounded="lg" className="mb-8 w-3/4" />
          <Skeleton height={16} rounded="lg" className="mb-4 w-1/2" />
          <Skeleton height={16} rounded="lg" className="w-1/3" />
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
