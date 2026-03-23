import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { RegisterInput, registerRequestSchema } from '@/schemas/userSchema';
import { useRegisterMutation } from './queries/mutations/useRegisterMutation';

export function useRegisterForm() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: { email: '', password: '', name: '', role: 'PetOwner' },
  });

  const { mutate, isPending } = useRegisterMutation();

  const onSubmit = (data: RegisterInput) => {
    mutate(data, {
      onSuccess: () => {
        // 회원가입 성공 → 로그인 화면으로 이동
        router.replace('/(auth)/login');
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 409) {
          setError('email', { message: '이미 사용 중인 이메일입니다' });
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
