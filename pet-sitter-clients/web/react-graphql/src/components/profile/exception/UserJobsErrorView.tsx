import { Button, Flex, Spacing, Text } from '@/design-system';

interface Props {
  error: Error;
  reset: () => void;
}

/**
 * [Error] PetOwner 등록 공고 목록 에러 UI
 */
export function UserJobsErrorView({ error, reset }: Props) {
  return (
    <Flex direction="column" align="center" className="py-32">
      <Text size="b1" color="secondary">
        공고 목록을 불러오지 못했습니다.
      </Text>
      <Spacing size={8} />
      <Text size="b2" color="secondary">
        {error.message || '잠시 후 다시 시도해주세요.'}
      </Text>
      <Spacing size={16} />
      <Button variant="ghost" size="sm" onClick={reset}>
        다시 시도
      </Button>
    </Flex>
  );
}
