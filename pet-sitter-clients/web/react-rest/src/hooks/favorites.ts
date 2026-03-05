import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { favoriteService } from '@/services/favorite.service';

export const favoriteQueryKeys = {
  myList: () => ['favorites', 'my'] as const,
};

/**
 * [Data Hook] GET /favorites — 내 즐겨찾기 목록 (PetSitter 전용)
 */
export function useMyFavoritesQuery() {
  return useSuspenseQuery({
    queryKey: favoriteQueryKeys.myList(),
    queryFn: () => favoriteService.getMyFavorites(),
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * [Data Hook] GET /favorites — 내 즐겨찾기 목록 (PetSitter 전용, 조건부 페치)
 *
 * isPetSitter가 false이면 API를 호출하지 않습니다.
 * 목록 페이지처럼 PetSitter 여부를 먼저 판단한 뒤 선택적으로 데이터가 필요한 경우에 사용합니다.
 */
export function useMyFavoritesOptionalQuery(isPetSitter: boolean) {
  return useQuery({
    queryKey: favoriteQueryKeys.myList(),
    queryFn: () => favoriteService.getMyFavorites(),
    staleTime: 1000 * 60 * 3,
    enabled: isPetSitter,
  });
}

/**
 * [Mutation Hook] POST /favorites — 즐겨찾기 토글 (PetSitter 전용)
 * 반환값 { added: true } → 추가, { added: false } → 제거
 * 성공 시 즐겨찾기 목록 캐시 무효화
 */
export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => favoriteService.toggle(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.myList() });
    },
  });
}

/**
 * [Mutation Hook] DELETE /favorites/:jobId — 즐겨찾기 제거 (PetSitter 전용)
 * 성공 시 즐겨찾기 목록 캐시 무효화
 */
export function useRemoveFavoriteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => favoriteService.remove(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteQueryKeys.myList() });
    },
  });
}
