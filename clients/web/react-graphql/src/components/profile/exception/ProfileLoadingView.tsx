import { Flex, Skeleton, Spacing } from '@/design-system';

/**
 * [Loading] 프로필 카드 로딩 스켈레톤
 */
export function ProfileLoadingView() {
  return (
    <div className="p-20 rounded-2xl border border-grey200 bg-white">
      <Flex align="center" gap={16} className="mb-16">
        <Skeleton width={64} height={64} rounded="full" />
        <Flex direction="column" gap={8} className="flex-1">
          <Skeleton height={22} rounded="lg" className="w-1/3" />
          <Skeleton height={16} rounded="lg" className="w-1/2" />
        </Flex>
      </Flex>
      <Spacing size={8} />
      <Skeleton height={16} rounded="lg" className="w-2/3" />
    </div>
  );
}
