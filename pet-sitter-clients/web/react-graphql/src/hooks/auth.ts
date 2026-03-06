import { useState } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

import { LOGIN, LOGOUT } from '@/graphql/mutations/auth';
import { CREATE_USER } from '@/graphql/mutations/user';
import { GET_USER } from '@/graphql/queries/user';
import { useAuthStore } from '@/store/useAuthStore';

import type { LoginInput } from '@/schemas/auth.schema';
import type { CreateUserInput, User } from '@/schemas/user.schema';

/* ─── useLoginMutation ───────────────────────────────────────── */

/**
 * 1. mutation Login → { user_id, accessToken, refreshToken }
 * 2. client.query(GET_USER, token 직접 주입) → User
 * 3. setAuth(accessToken, refreshToken, user)
 */
export function useLoginMutation() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const client = useApolloClient();

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (data: LoginInput) => {
    setIsPending(true);
    setError(null);
    try {
      const loginResult = await client.mutate<{
        login: { user_id: string; accessToken: string; refreshToken: string };
      }>({
        mutation: LOGIN,
        variables: data,
      });

      const { user_id, accessToken, refreshToken } = loginResult.data!.login;

      // 새 토큰으로 직접 사용자 조회 (인터셉터 우회)
      const userResult = await client.query<{ user: User }>({
        query: GET_USER,
        variables: { id: user_id },
        context: { headers: { Authorization: `Bearer ${accessToken}` } },
        fetchPolicy: 'network-only',
      });

      setAuth(accessToken, refreshToken, userResult.data.user);
      navigate('/jobs', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
}

/* ─── useSignupMutation ──────────────────────────────────────── */

/**
 * mutation CreateUser — 회원가입 후 로그인 페이지로 이동
 */
export function useSignupMutation() {
  const navigate = useNavigate();

  const [executeCreate, { loading, error }] = useMutation<
    { createUser: User },
    { email: string; full_name: string; password: string; roles: string[] }
  >(CREATE_USER, {
    onCompleted: () => {
      navigate('/login', { state: { signupSuccess: true } });
    },
  });

  const mutate = (data: CreateUserInput) => {
    executeCreate({
      variables: {
        email: data.email,
        full_name: data.full_name,
        password: data.password,
        roles: data.roles,
      },
    }).catch(() => {});
  };

  return { mutate, isPending: loading, error: error ?? null };
}

/* ─── useLogoutMutation ──────────────────────────────────────── */

/**
 * mutation Logout — 서버 세션 삭제 후 클라이언트 상태 초기화
 */
export function useLogoutMutation() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const [executeLogout, { loading, error }] = useMutation(LOGOUT, {
    onCompleted: () => {
      clearAuth();
      navigate('/login', { replace: true });
    },
    onError: () => {
      // 서버 오류가 나도 클라이언트 상태는 초기화
      clearAuth();
      navigate('/login', { replace: true });
    },
  });

  const mutate = () => {
    executeLogout().catch(() => {});
  };

  return { mutate, isPending: loading, error: error ?? null };
}
