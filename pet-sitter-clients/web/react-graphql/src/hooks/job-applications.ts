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
 * [Data Hook] 공고별 지원 목록 조회
 *
 * 서버 스키마: jobApplicationsByJob(jobId: String!): [JobApplicationModel!]!
 * 직접 배열 반환 → { items: [...] } 형태로 래핑하여 기존 컴포넌트 인터페이스 유지
 */
export function useJobApplicationsQuery(jobId: string) {
  const { data } = useSuspenseQuery<{ jobApplicationsByJob: JobApplication[] }>(
    GET_JOB_APPLICATIONS,
    { variables: { jobId } },
  );

  return { data: { items: data?.jobApplicationsByJob ?? [] } as JobApplicationList };
}

/**
 * [Mutation Hook] 구인공고 지원 (PetSitter 전용)
 * 서버 스키마: applyToJob(jobId: String!): JobApplicationModel!
 */
export function useApplyJobMutation(jobId: string) {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{ applyToJob: JobApplication }>(
    APPLY_JOB,
    {
      onCompleted: () => {
        client.refetchQueries({ include: ['GetJobApplications'] });
      },
    },
  );

  const mutate = (_?: undefined, options?: MutationOptions<JobApplication>) => {
    execute({ variables: { jobId } })
      .then((result) => {
        options?.onSuccess?.(result.data!.applyToJob);
        options?.onSettled?.();
      })
      .catch((err: Error) => {
        options?.onError?.(err);
        options?.onSettled?.();
      });
  };

  const mutateAsync = async () => {
    const result = await execute({ variables: { jobId } });
    return result.data!.applyToJob;
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    isSuccess: !!data && !loading,
    data: data?.applyToJob ?? null,
  };
}

/**
 * [Mutation Hook] 지원 상태 수정 (공고 작성자만)
 * 서버 스키마: updateJobApplicationStatus(data: UpdateJobApplicationInput!, id: String!)
 */
export function useUpdateJobApplicationMutation(_jobId: string) {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{
    updateJobApplicationStatus: JobApplication;
  }>(UPDATE_JOB_APPLICATION, {
    onCompleted: () => {
      client.refetchQueries({ include: ['GetJobApplications'] });
    },
  });

  const mutate = (
    args: { jobApplicationId: string; data: UpdateJobApplicationInput },
    options?: MutationOptions<JobApplication>,
  ) => {
    execute({ variables: { id: args.jobApplicationId, data: { status: args.data.status } } })
      .then((result) => {
        options?.onSuccess?.(result.data!.updateJobApplicationStatus);
        options?.onSettled?.();
      })
      .catch((err: Error) => {
        options?.onError?.(err);
        options?.onSettled?.();
      });
  };

  const mutateAsync = async (args: {
    jobApplicationId: string;
    data: UpdateJobApplicationInput;
  }) => {
    const result = await execute({
      variables: { id: args.jobApplicationId, data: { status: args.data.status } },
    });
    return result.data!.updateJobApplicationStatus;
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    isSuccess: !!data && !loading,
    data: data?.updateJobApplicationStatus ?? null,
  };
}
