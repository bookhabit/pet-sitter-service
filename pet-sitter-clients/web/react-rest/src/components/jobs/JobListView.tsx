import { Button, Flex, Spacing, Text } from '@/design-system';

import { JobCard } from './JobCard';

import type { Job } from '@/schemas/job.schema';

interface Props {
  jobs: Job[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

/**
 * [View] 구인공고 목록 — 순수 UI 표현만 담당
 * 데이터 로직 없음, props 렌더링만 수행
 */
export function JobListView({ jobs, hasNextPage, isFetchingNextPage, onLoadMore }: Props) {
  if (jobs.length === 0) {
    return (
      <Flex direction="column" align="center" className="py-64">
        <Text size="t2" color="secondary" className="text-center">
          등록된 구인공고가 없습니다.
        </Text>
        <Spacing size={8} />
        <Text size="b2" color="secondary" className="text-center">
          첫 번째 구인공고를 등록해보세요!
        </Text>
      </Flex>
    );
  }

  return (
    <>
      <Flex direction="column" gap={12}>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </Flex>

      {hasNextPage && (
        <>
          <Spacing size={16} />
          <Button
            variant="ghost"
            size="md"
            className="w-full"
            isLoading={isFetchingNextPage}
            onClick={onLoadMore}
          >
            더 보기
          </Button>
        </>
      )}
    </>
  );
}
