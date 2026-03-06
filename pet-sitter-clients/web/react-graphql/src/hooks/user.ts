import { useMutation, useQuery, useSuspenseQuery, useApolloClient } from '@apollo/client';

import { GET_USER, GET_USER_JOBS, GET_USER_JOB_APPLICATIONS } from '@/graphql/queries/user';
import { UPDATE_USER, DELETE_USER } from '@/graphql/mutations/user';
import { useAuthStore } from '@/store/useAuthStore';

import type { Job } from '@/schemas/job.schema';
import type { JobApplication } from '@/schemas/job-application.schema';
import type { UpdateUserInput, User } from '@/schemas/user.schema';

/* ─── Mutation 옵션 타입 ─────────────────────────────────────── */

interface MutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

/* ─── Queries ────────────────────────────────────────────────── */

/**
 * GET /users/:id — 사용자 정보 조회
 * id 생략 시 현재 로그인 사용자 ID 사용
 */
export function useUserQuery(id?: string) {
  const currentUser = useAuthStore((s) => s.user);
  const userId = id ?? currentUser?.id;

  const { data, loading, error, refetch } = useQuery<{ user: User }>(GET_USER, {
    variables: { id: userId },
    skip: !userId,
  });

  return {
    data: data?.user ?? null,
    loading,
    error,
    // TanStack 호환 alias
    isPending: loading,
    isError: !!error,
    refetch,
  };
}

/** GET /users/:id/jobs — 사용자가 등록한 공고 목록 */
export function useUserJobsQuery(id: string) {
  const { data } = useSuspenseQuery<{ userJobs: Job[] }>(GET_USER_JOBS, {
    variables: { userId: id },
  });

  return { data: data?.userJobs ?? [] };
}

/** GET /users/:id/job-applications — 사용자가 지원한 공고 목록 */
export function useUserJobApplicationsQuery(id: string) {
  const { data } = useSuspenseQuery<{ userJobApplications: JobApplication[] }>(
    GET_USER_JOB_APPLICATIONS,
    { variables: { userId: id } },
  );

  return { data: data?.userJobApplications ?? [] };
}

/* ─── Mutations ──────────────────────────────────────────────── */

/** PUT /users/:id — 사용자 정보 수정, 성공 시 상세 캐시 갱신 */
export function useUpdateUserMutation(id: string) {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{ updateUser: User }>(UPDATE_USER, {
    onCompleted: () => {
      client.refetchQueries({ include: ['GetUser'] });
    },
  });

  const mutate = (input: UpdateUserInput, options?: MutationOptions<User>) => {
    execute({ variables: { id, ...input } })
      .then((result) => {
        options?.onSuccess?.(result.data!.updateUser);
        options?.onSettled?.();
      })
      .catch((err: Error) => {
        options?.onError?.(err);
        options?.onSettled?.();
      });
  };

  const mutateAsync = async (input: UpdateUserInput) => {
    const result = await execute({ variables: { id, ...input } });
    return result.data!.updateUser;
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    isSuccess: !!data && !loading,
    data: data?.updateUser ?? null,
  };
}

/** DELETE /users/:id — 사용자 삭제, 성공 시 캐시 제거 */
export function useDeleteUserMutation() {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{ deleteUser: { id: string } }>(
    DELETE_USER,
  );

  const mutate = (userId: string, options?: MutationOptions<{ id: string }>) => {
    execute({ variables: { id: userId } })
      .then((result) => {
        const deletedId = result.data?.deleteUser?.id;
        if (deletedId) {
          client.cache.evict({ id: client.cache.identify({ __typename: 'User', id: deletedId }) });
          client.cache.gc();
        }
        options?.onSuccess?.(result.data!.deleteUser);
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
