import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/useAuthStore';

import type { UpdateUserInput } from '@/schemas/user.schema';

/* ─── Query Keys ─────────────────────────────────────────────── */

export const userQueryKeys = {
  detail: (id: string) => ['users', id] as const,
  jobs: (id: string) => ['users', id, 'jobs'] as const,
  jobApplications: (id: string) => ['users', id, 'job-applications'] as const,
};

/* ─── Queries ────────────────────────────────────────────────── */

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
    staleTime: 1000 * 60 * 5,
  });
}

/** GET /users/:id/jobs — 사용자가 등록한 공고 목록 */
export function useUserJobsQuery(id: string) {
  return useSuspenseQuery({
    queryKey: userQueryKeys.jobs(id),
    queryFn: () => userService.getUserJobs(id),
    staleTime: 1000 * 60 * 3,
  });
}

/** GET /users/:id/job-applications — 사용자가 지원한 공고 목록 */
export function useUserJobApplicationsQuery(id: string) {
  return useSuspenseQuery({
    queryKey: userQueryKeys.jobApplications(id),
    queryFn: () => userService.getUserJobApplications(id),
    staleTime: 1000 * 60 * 3,
  });
}

/* ─── Mutations ──────────────────────────────────────────────── */

/** PUT /users/:id — 사용자 정보 수정, 성공 시 상세 캐시 무효화 */
export function useUpdateUserMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUserInput) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
    },
  });
}

/** DELETE /users/:id — 사용자 삭제, 성공 시 캐시 제거 */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: userQueryKeys.detail(id) });
    },
  });
}
