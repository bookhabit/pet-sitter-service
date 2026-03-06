import { useMutation, useQuery, useSuspenseQuery, useApolloClient } from '@apollo/client';

import { GET_MY_FAVORITES } from '@/graphql/queries/favorites';
import { TOGGLE_FAVORITE, REMOVE_FAVORITE } from '@/graphql/mutations/favorites';

import type { Job } from '@/schemas/job.schema';
import type { ToggleFavoriteResult } from '@/schemas/favorite.schema';

/* ─── Mutation 옵션 타입 ─────────────────────────────────────── */

interface MutationOptions<TData = void> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}

/**
 * [Data Hook] GET /favorites — 내 즐겨찾기 목록 (PetSitter 전용)
 */
export function useMyFavoritesQuery() {
  const { data } = useSuspenseQuery<{ myFavorites: Job[] }>(GET_MY_FAVORITES);
  return { data: data?.myFavorites ?? [] };
}

/**
 * [Data Hook] GET /favorites — 내 즐겨찾기 목록 (PetSitter 전용, 조건부 페치)
 *
 * isPetSitter가 false이면 API를 호출하지 않습니다.
 */
export function useMyFavoritesOptionalQuery(isPetSitter: boolean) {
  const { data, loading, error } = useQuery<{ myFavorites: Job[] }>(GET_MY_FAVORITES, {
    skip: !isPetSitter,
  });

  return { data: data?.myFavorites ?? undefined, loading, error };
}

/**
 * [Mutation Hook] POST /favorites — 즐겨찾기 토글 (PetSitter 전용)
 * 반환값 { added: true } → 추가, { added: false } → 제거
 * 성공 시 즐겨찾기 목록 캐시 갱신
 */
export function useToggleFavoriteMutation() {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation<{
    toggleFavorite: ToggleFavoriteResult;
  }>(TOGGLE_FAVORITE, {
    onCompleted: () => {
      client.refetchQueries({ include: ['GetMyFavorites'] });
    },
  });

  const mutate = (jobId: string) => {
    execute({ variables: { job_id: jobId } }).catch(() => {});
  };

  const mutateAsync = async (jobId: string) => {
    const result = await execute({ variables: { job_id: jobId } });
    return result.data!.toggleFavorite;
  };

  return {
    mutate,
    mutateAsync,
    isPending: loading,
    error: error ?? null,
    isSuccess: !!data && !loading,
    data: data?.toggleFavorite ?? null,
  };
}

/**
 * [Mutation Hook] DELETE /favorites/:jobId — 즐겨찾기 제거 (PetSitter 전용)
 * 성공 시 즐겨찾기 목록 캐시 갱신
 */
export function useRemoveFavoriteMutation() {
  const client = useApolloClient();

  const [execute, { loading, error, data }] = useMutation(REMOVE_FAVORITE, {
    onCompleted: () => {
      client.refetchQueries({ include: ['GetMyFavorites'] });
    },
  });

  const mutate = (jobId: string, options?: MutationOptions<void>) => {
    execute({ variables: { job_id: jobId } })
      .then(() => {
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
