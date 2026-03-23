import { Flex, Spacing, Text } from '@/design-system';

/**
 * [Empty] PetOwner 등록 공고 없음 안내 UI
 */
export function UserJobsEmptyView() {
  return (
    <Flex direction="column" align="center" className="py-32">
      <Text size="b1" color="secondary" className="text-center">
        등록한 구인공고가 없습니다.
      </Text>
      <Spacing size={8} />
      <Text size="b2" color="secondary" className="text-center">
        구인공고를 등록하면 이곳에 표시됩니다.
      </Text>
    </Flex>
  );
}
