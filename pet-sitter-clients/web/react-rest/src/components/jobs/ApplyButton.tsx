import { Badge, Button, Flex, Spacing, Text } from '@/design-system';

import type { ApproveStatus } from '@/schemas/job-application.schema';

interface Props {
  /** 현재 로그인한 PetSitter의 지원 상태. null이면 미지원 */
  appliedStatus: ApproveStatus | null;
  /** 지원 진행 중 (중복 클릭 방지) */
  isApplying: boolean;
  /** mutation 에러 메시지. null이면 에러 없음 */
  errorMessage: string | null;
  onApply: () => void;
}

const STATUS_LABEL: Record<ApproveStatus, string> = {
  applying: '검토 중',
  approved: '승인됨',
  rejected: '거절됨',
};

const STATUS_BADGE_VARIANT: Record<ApproveStatus, 'neutral' | 'success' | 'danger'> = {
  applying: 'neutral',
  approved: 'success',
  rejected: 'danger',
};

/**
 * [View] PetSitter 전용 지원 버튼 / 지원 상태 표시
 *
 * - 미지원 상태: "지원하기" 버튼 표시
 * - 지원 완료 상태: 현재 상태를 Badge로 표시 (버튼 비활성)
 */
export function ApplyButton({ appliedStatus, isApplying, errorMessage, onApply }: Props) {
  return (
    <div>
      {appliedStatus === null ? (
        <Button
          variant="primary"
          size="md"
          isLoading={isApplying}
          onClick={onApply}
          className="w-full"
        >
          지원하기
        </Button>
      ) : (
        <Flex direction="column" align="center" gap={8}>
          <Text size="b2" color="secondary">
            이미 지원한 공고입니다.
          </Text>
          <Badge variant={STATUS_BADGE_VARIANT[appliedStatus]} size="md">
            {STATUS_LABEL[appliedStatus]}
          </Badge>
        </Flex>
      )}

      {errorMessage !== null && (
        <>
          <Spacing size={8} />
          <Text size="caption" className="text-center text-danger">
            {errorMessage}
          </Text>
        </>
      )}
    </div>
  );
}
