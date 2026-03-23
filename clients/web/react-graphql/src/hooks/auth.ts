import { useState } from 'react';
import { useMutation, useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

import { LOGIN, REGISTER } from '@/graphql/mutations/auth';
import { GET_USER } from '@/graphql/queries/user';
import { useAuthStore } from '@/store/useAuthStore';

import type { LoginInput } from '@/schemas/auth.schema';
import type { CreateUserInput, User } from '@/schemas/user.schema';

/* ─── useLoginMutation ───────────────────────────────────────── */

/**
 * 1. mutation Login → { user_id, accessToken, refreshToken }
 * 2. client.query(GET_USER, 새 토큰 직접 주입) → User
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
        variables: { data },
      });

      const { user_id, accessToken, refreshToken } = loginResult.data!.login;

      // 새 토큰으로 직접 사용자 조회 (authLink 우회)
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
 * mutation Register — 회원가입 후 로그인 페이지로 이동
 *
 * 서버 스키마: register(data: RegisterInput!): UserModel!
 */
export function useSignupMutation() {
  const navigate = useNavigate();

  const [executeRegister, { loading, error }] = useMutation<{ register: User }>(REGISTER, {
    onCompleted: () => {
      navigate('/login', { state: { signupSuccess: true } });
    },
  });

  const mutate = (data: CreateUserInput) => {
    executeRegister({
      variables: {
        data: {
          email: data.email,
          full_name: data.full_name,
          password: data.password,
          roles: data.roles,
        },
      },
    }).catch(() => {});
  };

  return { mutate, isPending: loading, error: error ?? null };
}

/* ─── useLogoutMutation ──────────────────────────────────────── */

/**
 * 서버 스키마에 logout mutation이 없으므로 클라이언트 상태만 초기화
 */
export function useLogoutMutation() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const mutate = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return { mutate, isPending: false, error: null };
}
