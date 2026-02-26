import { Flex, Skeleton, Spacing } from '@/design-system';

export function JobListLoadingView() {
  return (
    <Flex direction="column" gap={12} className="p-16">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-grey200 rounded-2xl border bg-white p-16">
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
