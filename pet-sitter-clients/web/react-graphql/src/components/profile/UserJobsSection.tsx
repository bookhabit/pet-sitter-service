import { Flex, Spacing, Text } from '@/design-system';

import { JobCard } from '@/components/jobs/JobCard';
import type { Job } from '@/schemas/job.schema';

interface Props {
  jobs: Job[];
}

/**
 * [View] PetOwner 등록 공고 목록 — 순수 UI 표현만 담당
 *
 * 빈 배열 처리는 호출부(Container)의 EmptyBoundary에서 담당합니다.
 */
export function UserJobsSection({ jobs }: Props) {
  return (
    <section>
      <Text as="h2" size="t2" className="font-bold">
        등록한 구인공고 ({jobs.length}건)
      </Text>

      <Spacing size={16} />

      <Flex direction="column" gap={12} as="ul">
        {jobs.map((job) => (
          <li key={job.id} style={{ listStyle: 'none' }}>
            <JobCard job={job} />
          </li>
        ))}
      </Flex>
    </section>
  );
}
