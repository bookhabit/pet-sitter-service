import { useQuery } from '@tanstack/react-query';

import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/useAuthStore';

/* ─── Query Keys ─────────────────────────────────────────────── */

export const userQueryKeys = {
  detail: (id: string) => ['users', id] as const,
};

/* ─── useUserQuery ───────────────────────────────────────────── */

/**
 * GET /users/:id — 사용자 정보 조회
 * id 생략 시 현재 로그인 사용자 ID 사용
 */
export function useUserQuery(id?: string) {
  const currentUser = useAuthStore((s) => s.user);
  const userId = id ?? currentUser?.id;

  return useQuery({
    queryKey: userQueryKeys.detail(userId ?? ''),
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분 캐싱
  });
}
