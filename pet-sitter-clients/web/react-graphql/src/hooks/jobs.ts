import { useState, useCallback } from 'react';
import { useMutation, useSuspenseQuery, useApolloClient } from '@apollo/client';

import { GET_JOBS, GET_JOB } from '@/graphql/queries/jobs';
import { CREATE_JOB, UPDATE_JOB, DELETE_JOB } from '@/graphql/mutations/jobs';

import type { CreateJobInput, Job, JobsQueryParams, PaginatedJobs, UpdateJobInput } from '@/schemas/job.schema';

/* ─── Mutation 옵션 타입 ─────────────────────────────────────── */

interface MutationOptions<TData = void> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

/* ─── 쿼리 변수 변환 헬퍼 ─────────────────────────────────────── */

/** REST QueryParams(snake_case + bracket 표기) → GraphQL 변수로 변환 */
function toGqlVariables(params?: Omit<JobsQueryParams, 'cursor'>) {
  return {
    limit: params?.limit,
    activity: params?.activity,
    sort: params?.sort,
    start_time_before: params?.start_time_before,
    start_time_after: params?.start_time_after,
    end_time_before: params?.end_time_before,
    end_time_after: params?.end_time_after,
    pets_age_below: params?.['pets[age_below]'],
    pets_age_above: params?.['pets[age_above]'],
    pets_species: params?.['pets[species]'],
    min_price: params?.min_price,
    max_price: params?.max_price,
  };
}

/* ─── useJobsQuery ───────────────────────────────────────────── */

/**
 * [Data Hook] GET /jobs — 커서 기반 무한 스크롤 구인공고 목록
 *
 * Apollo useSuspenseQuery + fetchMore를 사용합니다.
 * InMemoryCache의 jobs field merge 정책이 items를 자동으로 누적합니다.
 *
 * 컴포넌트 호환성: TanStack InfiniteQuery와 동일한 인터페이스 제공
 * - data.pages[0].items = 누적된 모든 공고
 * - fetchNextPage, hasNextPage, isFetchingNextPage
 */
export function useJobsQuery(params?: Omit<JobsQueryParams, 'cursor'>) {
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const { data, fetchMore } = useSuspenseQuery<{ jobs: PaginatedJobs }>(GET_JOBS, {
    variables: toGqlVariables(params),
  });

  const hasNextPage = data?.jobs?.pageInfo?.hasNextPage ?? false;

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;
    setIsFetchingNextPage(true);
    try {
      await fetchMore({
        variables: { cursor: data?.jobs?.pageInfo?.endCursor },
      });
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [hasNextPage, isFetchingNextPage, fetchMore, data?.jobs?.pageInfo?.endCursor]);

  // TanStack InfiniteQuery 호환 형태로 래핑
  // Apollo cache merge가 items를 누적하므로 pages[0]에 전체 목록이 담김
  return {
    data: { pages: [data?.jobs] as PaginatedJobs[] },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}

/* ─── useJobQuery ────────────────────────────────────────────── */

/**
 * [Data Hook] GET /jobs/:id — 구인공고 상세 조회
 */
export function useJobQuery(id: string) {
  const { data } = useSuspenseQuery<{ job: Job }>(GET_JOB, {
    variables: { id },
  });

  return { data: data?.job };
}

/* ─── useCreateJobMutation ───────────────────────────────────── */

/**
 * [Mutation Hook] POST /jobs — 구인공고 등록 (PetOwner 전용)
 * 성공 시 목록 캐시 갱신
 */
export function useCreateJobMutation() {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{ createJob: Job }>(CREATE_JOB, {
    onCompleted: () => {
      client.refetchQueries({ include: ['GetJobs'] });
    },
  });

  const mutate = (input: CreateJobInput, options?: MutationOptions<Job>) => {
    execute({ variables: input })
      .then((result) => {
        options?.onSuccess?.(result.data!.createJob);
        options?.onSettled?.();
      })
      .catch((err: Error) => {
        options?.onError?.(err);
        options?.onSettled?.();
      });
  };

  const mutateAsync = async (input: CreateJobInput) => {
    const result = await execute({ variables: input });
    return result.data!.createJob;
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    isSuccess: !!data && !loading,
    data: data?.createJob ?? null,
  };
}

/* ─── useUpdateJobMutation ───────────────────────────────────── */

/**
 * [Mutation Hook] PUT /jobs/:id — 구인공고 수정 (작성자 또는 Admin)
 * 성공 시 상세/목록 캐시 갱신
 */
export function useUpdateJobMutation(id: string) {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{ updateJob: Job }>(UPDATE_JOB, {
    onCompleted: () => {
      client.refetchQueries({ include: ['GetJob', 'GetJobs'] });
    },
  });

  const mutate = (input: UpdateJobInput, options?: MutationOptions<Job>) => {
    execute({ variables: { id, ...input } })
      .then((result) => {
        options?.onSuccess?.(result.data!.updateJob);
        options?.onSettled?.();
      })
      .catch((err: Error) => {
        options?.onError?.(err);
        options?.onSettled?.();
      });
  };

  const mutateAsync = async (input: UpdateJobInput) => {
    const result = await execute({ variables: { id, ...input } });
    return result.data!.updateJob;
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    isSuccess: !!data && !loading,
    data: data?.updateJob ?? null,
  };
}

/* ─── useDeleteJobMutation ───────────────────────────────────── */

/**
 * [Mutation Hook] DELETE /jobs/:id — 구인공고 삭제 (작성자 또는 Admin)
 * 성공 시 캐시에서 제거 및 목록 갱신
 */
export function useDeleteJobMutation() {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{ deleteJob: { id: string } }>(
    DELETE_JOB,
  );

  const mutate = (jobId: string, options?: MutationOptions<void>) => {
    execute({ variables: { id: jobId } })
      .then((result) => {
        const deletedId = result.data?.deleteJob?.id;
        if (deletedId) {
          client.cache.evict({ id: client.cache.identify({ __typename: 'Job', id: deletedId }) });
          client.cache.gc();
        }
        client.refetchQueries({ include: ['GetJobs'] });
        options?.onSuccess?.();
        options?.onSettled?.();
      })
      .catch((err: Error) => {
        options?.onError?.(err);
        options?.onSettled?.();
      });
  };

  return {
    mutate,
    isPending: loading,
    error: error ?? null,
    isSuccess: !!data && !loading,
  };
}
