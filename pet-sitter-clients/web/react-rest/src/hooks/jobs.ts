import { useInfiniteQuery } from '@tanstack/react-query';

import { jobService } from '@/services/job.service';

import type { JobsQueryParams } from '@/schemas/job.schema';

export const jobQueryKeys = {
  list: (params?: Omit<JobsQueryParams, 'cursor'>) => ['jobs', 'list', params] as const,
};

/**
 * [Data Hook] GET /jobs — 커서 기반 무한 스크롤 구인공고 목록
 *
 * TanStack Query useInfiniteQuery를 사용해 페이지네이션을 관리합니다.
 * pageParam = endCursor (서버 응답의 pageInfo.endCursor)
 */
export function useJobsQuery(params?: Omit<JobsQueryParams, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: jobQueryKeys.list(params),
    queryFn: ({ pageParam }) => jobService.getJobs({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? (lastPage.pageInfo.endCursor ?? undefined) : undefined,
    staleTime: 1000 * 60 * 3,
  });
}
