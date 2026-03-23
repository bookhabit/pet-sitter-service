import { useTransition } from 'react';

import { useJobsQuery } from '@/hooks/jobs';
import { useJobFilters, type JobFilters } from '@/hooks/forms/useJobFilters';
import { useMyFavoritesOptionalQuery, useToggleFavoriteMutation } from '@/hooks/favorites';
import { useAuthStore } from '@/store/useAuthStore';
import { Spacing } from '@/design-system';

import { JobListView } from './JobListView';
import { JobFilterPanel } from './JobFilterPanel';
import { EmptyBoundary } from '../common/globalException/boundary/EmptyBoundary';
import JobListEmptyView from './exception/JobListEmptyView';

/**
 * [Container] 구인공고 목록 데이터 연결 + 필터 상태 조율
 *
 * 책임: useJobFilters 호출 → JobFilterPanel 연결 → useJobsQuery에 필터 파라미터 전달
 *       PetSitter인 경우 즐겨찾기 상태를 함께 조회하여 JobListView에 전달
 * 절대 금지: JSX 스타일링 로직, 화면 구성 결정
 */
export function JobListContainer() {
  const [, startTransition] = useTransition();
  const { filters, setFilter, resetFilters, toQueryParams } = useJobFilters();

  const user = useAuthStore((s) => s.user);
  const isPetSitter = user?.roles.includes('PetSitter') ?? false;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useJobsQuery({
    limit: 10,
    ...toQueryParams(),
  });
  console.log('JobListContainer - data:', data);

  const { data: favoritesData } = useMyFavoritesOptionalQuery(isPetSitter);
  const { mutate: toggleFavorite } = useToggleFavoriteMutation();

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

  // 즐겨찾기 jobId를 Set으로 변환하여 O(1) 조회
  const favoriteJobIds = new Set(favoritesData?.map((job) => job.id) ?? []);

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
          isPetSitter={isPetSitter}
          favoriteJobIds={favoriteJobIds}
          onToggleFavorite={toggleFavorite}
        />
      </EmptyBoundary>
    </>
  );
}
