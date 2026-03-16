'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { jobApplicationService } from '@/services/job-application.service';

import type { UpdateJobApplicationInput } from '@/schemas/job-application.schema';

export const jobApplicationQueryKeys = {
  byJob: (jobId: string) => ['job-applications', 'byJob', jobId] as const,
};

/**
 * [Data Hook] GET /jobs/:jobId/job-applications — 공고별 지원 목록 조회
 */
export function useJobApplicationsQuery(jobId: string) {
  return useSuspenseQuery({
    queryKey: jobApplicationQueryKeys.byJob(jobId),
    queryFn: () => jobApplicationService.getJobApplicationsByJob(jobId),
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * [Mutation Hook] POST /jobs/:jobId/job-applications — 구인공고 지원 (PetSitter 전용)
 * 성공 시 해당 공고의 지원 목록 캐시 무효화
 */
export function useApplyJobMutation(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => jobApplicationService.applyJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobApplicationQueryKeys.byJob(jobId) });
    },
  });
}

/**
 * [Mutation Hook] PUT /job-applications/:jobApplicationId — 지원 상태 수정 (공고 작성자만)
 * 성공 시 해당 공고의 지원 목록 캐시 무효화
 */
export function useUpdateJobApplicationMutation(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobApplicationId,
      data,
    }: {
      jobApplicationId: string;
      data: UpdateJobApplicationInput;
    }) => jobApplicationService.updateJobApplication(jobApplicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobApplicationQueryKeys.byJob(jobId) });
    },
  });
}
