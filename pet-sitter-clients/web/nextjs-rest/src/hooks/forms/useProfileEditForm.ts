'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useUpdateUserMutation } from '@/hooks/user';
import { getHttpErrorStatus } from '@/utils/get-http-error-status';

import type { UpdateUserInput, User } from '@/schemas/user.schema';

/**
 * 프로필 수정 폼 전용 스키마.
 */
export const profileEditFormSchema = z.object({
  full_name: z.union([
    z
      .string()
      .min(1)
      .max(20, '이름은 최대 20자까지 입력할 수 있습니다.')
      .refine((v) => !/\d/.test(v), '이름에 숫자를 포함할 수 없습니다.'),
    z.literal(''),
  ]),
  email: z.union([z.string().email('유효한 이메일 형식을 입력해주세요.'), z.literal('')]),
  password: z.union([
    z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .max(20, '비밀번호는 최대 20자까지 입력할 수 있습니다.'),
    z.literal(''),
  ]),
});

export type ProfileEditFormInput = z.infer<typeof profileEditFormSchema>;

interface UseProfileEditFormProps {
  userId: string;
  /** 저장 성공 후 뷰 모드로 복귀시키는 콜백 */
  onSuccess: () => void;
  /** 현재 사용자 데이터 — 폼 defaultValues에 주입 */
  currentUser: User;
}

/**
 * [Logic Hook] 프로필 수정 폼 상태 + 서버 연결을 담당한다.
 *
 * 흐름: useForm(zodResolver) → useUpdateUserMutation → onSubmit
 * 빈 문자열 필드는 payload에서 제외하여 서버에 전송하지 않는다.
 */
export function useProfileEditForm({ userId, onSuccess, currentUser }: UseProfileEditFormProps) {
  const { mutate, isPending, error } = useUpdateUserMutation(userId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileEditFormInput>({
    resolver: zodResolver(profileEditFormSchema),
    defaultValues: {
      full_name: currentUser.full_name,
      email: currentUser.email,
      password: '',
    },
    mode: 'onBlur',
  });

  const serverError = (() => {
    if (!error) return null;
    const status = getHttpErrorStatus(error);
    if (status === 409) return '이미 사용 중인 이메일입니다.';
    if (status === 403) return '프로필 수정 권한이 없습니다.';
    if (status === 404) return '사용자를 찾을 수 없습니다.';
    return '프로필 수정 중 오류가 발생했습니다.';
  })();

  const onCancel = () => {
    reset();
  };

  const onSubmit = handleSubmit((data) => {
    const payload: UpdateUserInput = {};
    if (data.full_name !== '') payload.full_name = data.full_name;
    if (data.email !== '') payload.email = data.email;
    if (data.password !== '') payload.password = data.password;

    mutate(payload, {
      onSuccess: () => {
        onSuccess();
      },
    });
  });

  return {
    register,
    onSubmit,
    onCancel,
    errors,
    isPending,
    serverError,
  };
}
