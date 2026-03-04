import { useJobsQuery } from '@/hooks/jobs';
import { useJobFilters, type JobFilters } from '@/hooks/forms/useJobFilters';
import { Spacing } from '@/design-system';

import { JobListView } from './JobListView';
import { JobFilterPanel } from './JobFilterPanel';
import { EmptyBoundary } from '../common/globalException/boundary/EmptyBoundary';
import JobListEmptyView from './exception/JobListEmptyView';
import { useTransition } from 'react';

/**
 * [Container] 구인공고 목록 데이터 연결 + 필터 상태 조율
 *
 * 책임: useJobFilters 호출 → JobFilterPanel 연결 → useJobsQuery에 필터 파라미터 전달
 * 절대 금지: JSX 스타일링 로직, 화면 구성 결정
 */
export function JobListContainer() {
  const [isPending, startTransition] = useTransition();
  const { filters, setFilter, resetFilters, toQueryParams } = useJobFilters();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useJobsQuery({
    limit: 10,
    ...toQueryParams(),
  });

  // 필터 변경 시 transition 적용
  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    if (key === 'activity') {
      // 검색어는 transition 없이 즉시 업데이트하여 IME(한글) 깨짐 방지
      setFilter(key, value);
    } else {
      // 버튼, 체크박스 등은 transition으로 감싸 기존 리스트 유지 (깜빡임 방지)
      startTransition(() => {
        setFilter(key, value);
      });
    }
  };

  // pages 배열을 flat하여 단일 jobs 배열로 변환
  const jobs = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      <JobFilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      <Spacing size={24} />

      <EmptyBoundary data={jobs} fallback={<JobListEmptyView />}>
        <JobListView
          jobs={jobs}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
        />
      </EmptyBoundary>
    </>
  );
}
