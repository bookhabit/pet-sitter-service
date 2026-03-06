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

/**
 * REST QueryParams(snake_case) → GraphQL 변수로 변환
 *
 * 서버 스키마: jobs(filter: JobFilterInput, pagination: PaginationInput)
 * JobFilterInput 필드명은 camelCase (startTimeBefore, endTimeAfter 등)
 * PetFilterInput 필드명: ageBelow, ageAbove, species
 */
function toGqlVariables(params?: Omit<JobsQueryParams, 'cursor'>, cursor?: string) {
  const petsAge = params?.['pets[age_below]'] ?? params?.['pets[age_above]'];
  const petsSpecies = params?.['pets[species]'];

  const filter = {
    activity: params?.activity,
    startTimeBefore: params?.start_time_before,
    startTimeAfter: params?.start_time_after,
    endTimeBefore: params?.end_time_before,
    endTimeAfter: params?.end_time_after,
    minPrice: params?.min_price,
    maxPrice: params?.max_price,
    ...(petsAge !== undefined || petsSpecies !== undefined
      ? {
          pets: {
            ageBelow: params?.['pets[age_below]'],
            ageAbove: params?.['pets[age_above]'],
            species: petsSpecies ? [petsSpecies] : undefined,
          },
        }
      : {}),
  };

  // 모든 필터 값이 undefined면 filter 자체를 undefined로
  const hasFilter = Object.values(filter).some((v) => v !== undefined);

  return {
    filter: hasFilter ? filter : undefined,
    pagination: {
      cursor,
      limit: params?.limit,
    },
  };
}

/* ─── useJobsQuery ───────────────────────────────────────────── */

/**
 * [Data Hook] 커서 기반 무한스크롤 구인공고 목록
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
        variables: toGqlVariables(params, data?.jobs?.pageInfo?.endCursor ?? undefined),
      });
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [hasNextPage, isFetchingNextPage, fetchMore, data?.jobs?.pageInfo?.endCursor, params]);

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
 * [Data Hook] 구인공고 상세 조회
 */
export function useJobQuery(id: string) {
  const { data } = useSuspenseQuery<{ job: Job }>(GET_JOB, {
    variables: { id },
  });

  return { data: data?.job };
}

/* ─── useCreateJobMutation ───────────────────────────────────── */

/**
 * [Mutation Hook] 구인공고 등록 (PetOwner 전용)
 * 서버 스키마: createJob(data: CreateJobInput!)
 */
export function useCreateJobMutation() {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{ createJob: Job }>(CREATE_JOB, {
    onCompleted: () => {
      client.refetchQueries({ include: ['GetJobs'] });
    },
  });

  const mutate = (input: CreateJobInput, options?: MutationOptions<Job>) => {
    execute({ variables: { data: input } })
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
    const result = await execute({ variables: { data: input } });
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
 * [Mutation Hook] 구인공고 수정 (작성자 또는 Admin)
 * 서버 스키마: updateJob(data: UpdateJobInput!, id: String!)
 */
export function useUpdateJobMutation(id: string) {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{ updateJob: Job }>(UPDATE_JOB, {
    onCompleted: () => {
      client.refetchQueries({ include: ['GetJob', 'GetJobs'] });
    },
  });

  const mutate = (input: UpdateJobInput, options?: MutationOptions<Job>) => {
    execute({ variables: { id, data: input } })
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
    const result = await execute({ variables: { id, data: input } });
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
 * [Mutation Hook] 구인공고 삭제 (작성자 또는 Admin)
 * 서버 스키마: deleteJob(id: String!): Boolean!
 * Boolean 반환이므로 jobId를 mutate 인수에서 별도로 캐시 evict에 활용
 */
export function useDeleteJobMutation() {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{ deleteJob: boolean }>(DELETE_JOB);

  const mutate = (jobId: string, options?: MutationOptions<void>) => {
    execute({ variables: { id: jobId } })
      .then(() => {
        client.cache.evict({ id: client.cache.identify({ __typename: 'JobModel', id: jobId }) });
        client.cache.gc();
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
