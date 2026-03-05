import { useNavigate } from 'react-router-dom';

import { Badge, Flex, Spacing, Text } from '@/design-system';

import type { ApproveStatus, JobApplication } from '@/schemas/job-application.schema';
import { formatDateTime } from '@/utils/format';

interface Props {
  applications: JobApplication[];
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
 * [View] PetSitter 지원 공고 목록 — 순수 UI 표현만 담당
 *
 * 빈 배열 처리는 호출부(Container)의 EmptyBoundary에서 담당합니다.
 */
export function UserApplicationsSection({ applications }: Props) {
  const navigate = useNavigate();

  return (
    <section>
      <Text as="h2" size="t2" className="font-bold">
        지원한 공고 ({applications.length}건)
      </Text>

      <Spacing size={16} />

      <Flex direction="column" gap={12} as="ul">
        {applications.map((application) => (
          <li
            key={application.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/jobs/${application.job_id}`)}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/jobs/${application.job_id}`)}
            className="hover:border-primary/40 cursor-pointer rounded-2xl border border-grey200 bg-white p-16 transition-all hover:shadow-md active:scale-[0.99]"
            style={{ listStyle: 'none' }}
          >
            <Flex justify="between" align="center" gap={12}>
              <Text size="b2" color="secondary">
                지원일: {formatDateTime(application.createdAt)}
              </Text>
              <Badge variant={STATUS_BADGE_VARIANT[application.status]} size="sm">
                {STATUS_LABEL[application.status]}
              </Badge>
            </Flex>
          </li>
        ))}
      </Flex>
    </section>
  );
}
