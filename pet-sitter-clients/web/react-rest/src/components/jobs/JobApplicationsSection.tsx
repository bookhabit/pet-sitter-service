import { Badge, Button, Flex, Spacing, Text } from '@/design-system';

import type { ApproveStatus, JobApplication } from '@/schemas/job-application.schema';
import { formatDateTime } from '@/utils/format';

interface Props {
  applications: JobApplication[];
  /** 상태 변경 진행 중인 지원 ID (중복 클릭 방지) */
  updatingId: string | null;
  onApprove: (jobApplicationId: string) => void;
  onReject: (jobApplicationId: string) => void;
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
 * [View] PetOwner 전용 지원자 목록 + 승인/거절 버튼
 *
 * 빈 배열 처리는 호출부(Container)의 EmptyBoundary에서 담당합니다.
 */
export function JobApplicationsSection({ applications, updatingId, onApprove, onReject }: Props) {
  return (
    <section>
      <Text as="h2" size="t2" className="font-bold">
        지원자 목록 ({applications.length}명)
      </Text>

      <Spacing size={16} />

      <Flex direction="column" gap={12} as="ul">
        {applications.map((application) => {
          const isUpdating = updatingId === application.id;
          const isActionable = application.status === 'applying';

          return (
            <li key={application.id} className="rounded-2xl border border-grey200 bg-white p-16">
              <Flex justify="between" align="start" gap={12}>
                <Flex direction="column" gap={4}>
                  <Flex gap={8} align="center">
                    <Text size="b2" color="secondary">
                      지원일: {formatDateTime(application.createdAt)}
                    </Text>
                    <Badge variant={STATUS_BADGE_VARIANT[application.status]} size="sm">
                      {STATUS_LABEL[application.status]}
                    </Badge>
                  </Flex>
                </Flex>

                {/* 검토 중인 지원자만 승인/거절 가능 */}
                {isActionable && (
                  <Flex gap={8}>
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isUpdating}
                      onClick={() => onApprove(application.id)}
                    >
                      승인
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={isUpdating}
                      onClick={() => onReject(application.id)}
                    >
                      거절
                    </Button>
                  </Flex>
                )}
              </Flex>
            </li>
          );
        })}
      </Flex>
    </section>
  );
}
