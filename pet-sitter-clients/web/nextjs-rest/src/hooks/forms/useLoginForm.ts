'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';

import { useLoginMutation } from '@/hooks/auth';
import { loginInputSchema } from '@/schemas/auth.schema';
import { getHttpErrorStatus } from '@/utils/get-http-error-status';

import type { LoginInput } from '@/schemas/auth.schema';

/**
 * [Logic Hook] 로그인 폼 상태 + 서버 연결을 담당합니다.
 *
 * 흐름: useForm(zodResolver) → useLoginMutation → onSubmit
 * signupSuccess: useSearchParams()로 읽음 (react-router의 location.state 대체)
 */
export function useLoginForm() {
  const searchParams = useSearchParams();
  const { mutate, isPending, error } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    mode: 'onBlur',
  });

  const signupSuccess = searchParams.get('signupSuccess') === 'true';

  const serverError = (() => {
    if (!error) return null;
    const status = getHttpErrorStatus(error);
    if (status === 401) return '이메일 또는 비밀번호가 올바르지 않습니다.';
    return '로그인 중 오류가 발생했습니다.';
  })();

  const onSubmit = handleSubmit((data) => mutate(data));

  return { register, onSubmit, errors, isPending, serverError, signupSuccess };
}
