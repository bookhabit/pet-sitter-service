import { Flex, Skeleton, Spacing } from '@/design-system';

export function ChatRoomsLoadingView() {
  return (
    <Flex direction="column" gap={12} className="p-16">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-grey200 bg-white p-16">
          <Flex justify="between" align="center">
            <Flex direction="column" gap={8} className="flex-1">
              <Skeleton height={18} rounded="lg" className="w-1/3" />
              <Skeleton height={14} rounded="lg" className="w-2/3" />
            </Flex>
            <Spacing size={12} />
            <Skeleton width={24} height={24} rounded="full" />
          </Flex>
        </div>
      ))}
    </Flex>
  );
}
