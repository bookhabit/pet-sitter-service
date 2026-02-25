import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'react-router-dom';

import { useLoginMutation } from '@/hooks/auth';
import { loginInputSchema } from '@/schemas/auth.schema';

import type { LoginInput } from '@/schemas/auth.schema';

/**
 * [Logic Hook] 로그인 폼 상태 + 서버 연결을 담당합니다.
 *
 * 흐름: useForm(zodResolver) → useLoginMutation → onSubmit
 */
export function useLoginForm() {
  const location = useLocation();
  const { mutate, isPending, error } = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    mode: 'onBlur',
  });

  const signupSuccess =
    (location.state as { signupSuccess?: boolean } | null)?.signupSuccess ?? false;

  const serverError = (() => {
    if (!error) return null;
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 401) return '이메일 또는 비밀번호가 올바르지 않습니다.';
    return '로그인 중 오류가 발생했습니다.';
  })();

  const onSubmit = handleSubmit((data) => mutate(data));

  return { register, onSubmit, errors, isPending, serverError, signupSuccess };
}
