'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query';

import { jobService } from '@/services/job.service';

import type { CreateJobInput, JobsQueryParams, UpdateJobInput } from '@/schemas/job.schema';

export const jobQueryKeys = {
  list: (params?: Omit<JobsQueryParams, 'cursor'>) => ['jobs', 'list', params] as const,
  detail: (id: string) => ['jobs', 'detail', id] as const,
};

/**
 * [Data Hook] GET /jobs — 커서 기반 무한 스크롤 구인공고 목록
 *
 * TanStack Query useInfiniteQuery를 사용해 페이지네이션을 관리합니다.
 * pageParam = endCursor (서버 응답의 pageInfo.endCursor)
 */
export function useJobsQuery(params?: Omit<JobsQueryParams, 'cursor'>) {
  return useSuspenseInfiniteQuery({
    queryKey: jobQueryKeys.list(params),
    queryFn: ({ pageParam }) => jobService.getJobs({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage ? (lastPage.pageInfo.endCursor ?? undefined) : undefined,
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * [Data Hook] GET /jobs/:id — 구인공고 상세 조회
 */
export function useJobQuery(id: string) {
  return useSuspenseQuery({
    queryKey: jobQueryKeys.detail(id),
    queryFn: () => jobService.getJob(id),
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * [Mutation Hook] POST /jobs — 구인공고 등록 (PetOwner 전용)
 * 성공 시 목록 캐시 무효화
 */
export function useCreateJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobInput) => jobService.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'list'] });
    },
  });
}

/**
 * [Mutation Hook] PUT /jobs/:id — 구인공고 수정 (작성자 또는 Admin)
 * 성공 시 상세/목록 캐시 무효화
 */
export function useUpdateJobMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateJobInput) => jobService.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['jobs', 'list'] });
    },
  });
}

/**
 * [Mutation Hook] DELETE /jobs/:id — 구인공고 삭제 (작성자 또는 Admin)
 * 성공 시 상세 캐시 제거 및 목록 캐시 무효화
 */
export function useDeleteJobMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobService.deleteJob(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: jobQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['jobs', 'list'] });
    },
  });
}
