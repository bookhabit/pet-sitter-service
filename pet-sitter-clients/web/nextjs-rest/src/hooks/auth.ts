'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/useAuthStore';

import type { LoginInput } from '@/schemas/auth.schema';
import type { CreateUserInput } from '@/schemas/user.schema';

/* ─── useLoginMutation ───────────────────────────────────────── */

/**
 * POST /sessions → GET /users/:id 순서로 호출해 인증 상태를 확정합니다.
 *
 * 흐름:
 *   1. authService.login()             → { user_id, accessToken, refreshToken }
 *   2. userService.getUserWithToken()  → store 변경 없이 사용자 정보 조회
 *   3. setAuth(accessToken, refreshToken, user)
 */
export function useLoginMutation() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const payload = await authService.login(data);
      const user = await userService.getUserWithToken(payload.user_id, payload.accessToken);
      return { accessToken: payload.accessToken, refreshToken: payload.refreshToken, user };
    },
    onSuccess: ({ accessToken, refreshToken, user }) => {
      setAuth(accessToken, refreshToken, user);
      router.replace('/jobs');
    },
  });
}

/* ─── useSignupMutation ──────────────────────────────────────── */

/**
 * POST /users — 회원가입 후 로그인 페이지로 이동
 * 성공 시 signupSuccess=true 쿼리 파라미터를 전달해 로그인 페이지에서 안내 메시지 표시
 */
export function useSignupMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateUserInput) => userService.signup(data),
    onSuccess: () => {
      router.push('/login?signupSuccess=true');
    },
  });
}

/* ─── useLogoutMutation ──────────────────────────────────────── */

/**
 * DELETE /sessions — 서버 세션 삭제 후 클라이언트 상태 초기화
 */
export function useLogoutMutation() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      router.replace('/login');
    },
    onError: () => {
      // 서버 오류가 나도 클라이언트 상태는 초기화
      clearAuth();
      router.replace('/login');
    },
  });
}
