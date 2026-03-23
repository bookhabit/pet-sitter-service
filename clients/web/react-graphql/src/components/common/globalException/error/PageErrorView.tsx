import { useNavigate } from 'react-router-dom';

import { Button, Flex, Spacing, Text } from '@/design-system';

interface Props {
  error: Error;
  reset: () => void;
}

export function PageErrorView({ error, reset }: Props) {
  const navigate = useNavigate();

  return (
    <Flex direction="column" align="center" className="px-24 py-64">
      <Text size="t2" as="h2">
        데이터를 불러오지 못했어요
      </Text>
      <Spacing size={8} />
      <Text size="b2" color="secondary" className="text-center">
        {error.message || '잠시 후 다시 시도해주세요.'}
      </Text>
      <Spacing size={24} />
      <Button size="md" onClick={reset}>
        다시 시도
      </Button>
      <Spacing size={12} />
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        뒤로가기
      </Button>
    </Flex>
  );
}
