import { Flex, Skeleton, Spacing, Text } from '@/design-system';
import { useJobsQuery } from '@/hooks/jobs';

import { JobListView } from './JobListView';

/**
 * [Container] 구인공고 목록 데이터 연결
 *
 * 책임: useJobsQuery 호출 → 로딩/에러/성공 상태 분기 → JobListView에 데이터 전달
 * 절대 금지: JSX 스타일링 로직, 화면 구성 결정
 */
export function JobListContainer() {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useJobsQuery({ limit: 10 });
  console.log('JobListContainer - data:', data);

  if (isLoading) {
    return (
      <Flex direction="column" gap={12}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-grey200 rounded-2xl border bg-white p-16">
            <Skeleton height={24} rounded="lg" className="mb-8 w-3/4" />
            <Skeleton height={18} rounded="lg" className="mb-4 w-1/2" />
            <Skeleton height={18} rounded="lg" className="w-1/3" />
            <Spacing size={12} />
            <Flex gap={8}>
              <Skeleton width={64} height={24} rounded="md" />
              <Skeleton width={80} height={24} rounded="md" />
            </Flex>
          </div>
        ))}
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex direction="column" align="center" className="py-64">
        <Text size="t2" color="secondary">
          목록을 불러오지 못했습니다.
        </Text>
        <Spacing size={8} />
        <Text size="b2" color="secondary">
          {(error as { message?: string })?.message ?? '잠시 후 다시 시도해주세요.'}
        </Text>
      </Flex>
    );
  }

  // pages 배열을 flat하여 단일 jobs 배열로 변환
  const jobs = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <JobListView
      jobs={jobs}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={() => fetchNextPage()}
    />
  );
}
