import { useJobsQuery } from '@/hooks/jobs';

import { JobListView } from './JobListView';
import { EmptyBoundary } from '../common/globalException/boundary/EmptyBoundary';
import JobListEmptyView from './exception/JobListEmptyView';

/**
 * [Container] 구인공고 목록 데이터 연결
 *
 * 책임: useJobsQuery 호출 → 로딩/에러/성공 상태 분기 → JobListView에 데이터 전달
 * 절대 금지: JSX 스타일링 로직, 화면 구성 결정
 */
export function JobListContainer() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useJobsQuery({ limit: 10 });
  console.log('JobListContainer - data:', data);

  // pages 배열을 flat하여 단일 jobs 배열로 변환
  const jobs = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <EmptyBoundary data={jobs} fallback={<JobListEmptyView />}>
      <JobListView
        jobs={jobs}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />
    </EmptyBoundary>
  );
}
