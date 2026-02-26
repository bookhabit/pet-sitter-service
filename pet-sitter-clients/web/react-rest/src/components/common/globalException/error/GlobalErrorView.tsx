import { Button, Flex, Spacing, Text } from '@/design-system';

interface Props {
  error: Error;
}

export function GlobalErrorView({ error }: Props) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className="bg-background min-h-screen px-24"
    >
      <Text size="t1" as="h1" className="mb-8">
        문제가 발생했어요
      </Text>
      <Text size="b2" color="secondary" className="text-center">
        {error.message || '예기치 못한 오류가 발생했습니다.'}
      </Text>
      <Spacing size={32} />
      <Button size="lg" onClick={() => window.location.reload()}>
        페이지 새로고침
      </Button>
      <Spacing size={12} />
      <Button variant="ghost" size="md" onClick={() => (window.location.href = '/jobs')}>
        홈으로 돌아가기
      </Button>
    </Flex>
  );
}
