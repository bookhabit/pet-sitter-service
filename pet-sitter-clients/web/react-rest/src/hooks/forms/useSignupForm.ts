import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useSignupMutation } from '@/hooks/auth';
import { signupFormSchema } from '@/schemas/user.schema';
import { getHttpErrorStatus } from '@/utils/get-http-error-status';

import type { SignupFormInput, UserRole } from '@/schemas/user.schema';

/**
 * [Logic Hook] 회원가입 폼 상태 + 서버 연결을 담당합니다.
 *
 * 흐름: useForm(zodResolver) → selectedRole(useState) → useSignupMutation → onSubmit
 */
export function useSignupForm() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('PetSitter');
  const { mutate, isPending, error } = useSignupMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupFormInput>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { roles: ['PetSitter'] },
    mode: 'onBlur',
  });

  const serverError = (() => {
    if (!error) return null;
    const status = getHttpErrorStatus(error);
    if (status === 409) return '이미 사용 중인 이메일입니다.';
    if (status === 400) return '입력 정보를 확인해주세요.';
    return '회원가입 중 오류가 발생했습니다.';
  })();

  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    setValue('roles', [role], { shouldValidate: true });
  };

  const onSubmit = handleSubmit(({ email, full_name, password, roles }) => {
    mutate({ email, full_name, password, roles });
  });

  return { register, onSubmit, errors, isPending, serverError, selectedRole, selectRole };
}
