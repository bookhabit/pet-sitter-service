import { useMutation, useSuspenseQuery, useApolloClient } from '@apollo/client';

import { GET_JOB_APPLICATIONS } from '@/graphql/queries/job-applications';
import { APPLY_JOB, UPDATE_JOB_APPLICATION } from '@/graphql/mutations/job-applications';

import type { JobApplication, JobApplicationList, UpdateJobApplicationInput } from '@/schemas/job-application.schema';

/* ─── Mutation 옵션 타입 ─────────────────────────────────────── */

interface MutationOptions<TData = void> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

/**
 * [Data Hook] GET /jobs/:jobId/job-applications — 공고별 지원 목록 조회
 */
export function useJobApplicationsQuery(jobId: string) {
  const { data } = useSuspenseQuery<{ jobApplications: JobApplicationList }>(GET_JOB_APPLICATIONS, {
    variables: { jobId },
  });

  return { data: data?.jobApplications ?? { items: [] } };
}

/**
 * [Mutation Hook] POST /jobs/:jobId/job-applications — 구인공고 지원 (PetSitter 전용)
 * 성공 시 해당 공고의 지원 목록 캐시 갱신
 */
export function useApplyJobMutation(jobId: string) {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{ applyJob: JobApplication }>(APPLY_JOB, {
    onCompleted: () => {
      client.refetchQueries({ include: ['GetJobApplications'] });
    },
  });

  const mutate = (_?: undefined, options?: MutationOptions<JobApplication>) => {
    execute({ variables: { jobId } })
      .then((result) => {
        options?.onSuccess?.(result.data!.applyJob);
        options?.onSettled?.();
      })
      .catch((err: Error) => {
        options?.onError?.(err);
        options?.onSettled?.();
      });
  };

  const mutateAsync = async () => {
    const result = await execute({ variables: { jobId } });
    return result.data!.applyJob;
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    isSuccess: !!data && !loading,
    data: data?.applyJob ?? null,
  };
}

/**
 * [Mutation Hook] PUT /job-applications/:jobApplicationId — 지원 상태 수정 (공고 작성자만)
 * 성공 시 해당 공고의 지원 목록 캐시 갱신
 */
export function useUpdateJobApplicationMutation(_jobId: string) {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{
    updateJobApplication: JobApplication;
  }>(UPDATE_JOB_APPLICATION, {
    onCompleted: () => {
      client.refetchQueries({ include: ['GetJobApplications'] });
    },
  });

  const mutate = (
    args: { jobApplicationId: string; data: UpdateJobApplicationInput },
    options?: MutationOptions<JobApplication>,
  ) => {
    execute({ variables: { id: args.jobApplicationId, status: args.data.status } })
      .then((result) => {
        options?.onSuccess?.(result.data!.updateJobApplication);
        options?.onSettled?.();
      })
      .catch((err: Error) => {
        options?.onError?.(err);
        options?.onSettled?.();
      });
  };

  const mutateAsync = async (args: { jobApplicationId: string; data: UpdateJobApplicationInput }) => {
    const result = await execute({ variables: { id: args.jobApplicationId, status: args.data.status } });
    return result.data!.updateJobApplication;
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    isSuccess: !!data && !loading,
    data: data?.updateJobApplication ?? null,
  };
}
