'use client';

import { Button, Flex, Spacing, Text } from '@/design-system';

interface Props {
  onRetry: () => void;
}

/**
 * [Error] 프로필 카드 에러 UI
 */
export function ProfileErrorView({ onRetry }: Props) {
  return (
    <div className="p-20 rounded-2xl border border-grey200 bg-white">
      <Flex direction="column" align="center" className="py-16">
        <Text size="b1" color="secondary">
          프로필 정보를 불러오지 못했습니다.
        </Text>
        <Spacing size={8} />
        <Text size="b2" color="secondary">
          잠시 후 다시 시도해주세요.
        </Text>
        <Spacing size={16} />
        <Button variant="ghost" size="sm" onClick={onRetry}>
          다시 시도
        </Button>
      </Flex>
    </div>
  );
}
