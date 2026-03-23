import { Flex, Spacing, Text } from '@/design-system';

/**
 * [Empty] 지원자 없음 안내 UI
 */
export function JobApplicationsEmptyView() {
  return (
    <Flex direction="column" align="center" className="py-32">
      <Text size="b1" color="secondary" className="text-center">
        아직 지원자가 없습니다.
      </Text>
      <Spacing size={8} />
      <Text size="b2" color="secondary" className="text-center">
        지원자가 생기면 이곳에 표시됩니다.
      </Text>
    </Flex>
  );
}
