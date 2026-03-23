import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { LoginInput, loginRequestSchema } from '@/schemas/userSchema';
import { useLoginMutation } from './queries/mutations/useLoginMutation';

// useLoginForm: Logic Hook — 폼 상태와 서버 mutation을 연결
// View 컴포넌트는 이 훅의 반환값만 받아 렌더링하면 됨
export function useLoginForm() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutate, isPending } = useLoginMutation();

  const onSubmit = (data: LoginInput) => {
    mutate(data, {
      onError: (error: unknown) => {
        // 서버 에러 분류:
        // 401 → 이메일/비밀번호 오류
        // 그 외 → 서버 에러 (root.serverError)
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError('password', { message: '이메일 또는 비밀번호가 올바르지 않습니다' });
        } else {
          setError('root', { message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요' });
        }
      },
    });
  };

  return {
    control,
    errors,
    isLoading: isPending,
    onSubmit: handleSubmit(onSubmit),
  };
}
