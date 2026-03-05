import { Button, Flex, Spacing, Text, TextField } from '@/design-system';

import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { ProfileEditFormInput } from '@/hooks/forms/useProfileEditForm';

interface Props {
  register: UseFormRegister<ProfileEditFormInput>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  errors: FieldErrors<ProfileEditFormInput>;
  isPending: boolean;
  serverError: string | null;
}

/**
 * [View] 프로필 수정 폼 UI 컴포넌트
 *
 * 로직 없음 — 모든 상태는 props로 받는다.
 */
export function ProfileEditForm({
  register,
  onSubmit,
  onCancel,
  errors,
  isPending,
  serverError,
}: Props) {
  return (
    <div className="p-20 rounded-2xl border border-grey200 bg-white">
      <Text size="t2" as="h2" className="mb-16">
        프로필 수정
      </Text>

      <form onSubmit={onSubmit} noValidate>
        <Flex direction="column" gap={16}>
          <TextField
            label="이름"
            placeholder="변경할 이름을 입력해주세요"
            error={errors.full_name?.message}
            {...register('full_name')}
          />

          <TextField
            label="이메일"
            type="email"
            placeholder="변경할 이메일을 입력해주세요"
            error={errors.email?.message}
            {...register('email')}
          />

          <TextField
            label="새 비밀번호"
            type="password"
            placeholder="변경할 비밀번호를 입력해주세요 (8~20자)"
            error={errors.password?.message}
            {...register('password')}
          />
        </Flex>

        {serverError && (
          <>
            <Spacing size={12} />
            <Text size="b2" color="secondary" className="text-danger" role="alert">
              {serverError}
            </Text>
          </>
        )}

        <Spacing size={24} />

        <Flex gap={12} justify="end">
          <Button type="button" variant="ghost" size="md" onClick={onCancel} disabled={isPending}>
            취소
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isPending}>
            저장
          </Button>
        </Flex>
      </form>
    </div>
  );
}
