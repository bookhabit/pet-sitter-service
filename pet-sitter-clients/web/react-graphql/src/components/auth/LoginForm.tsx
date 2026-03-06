import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Flex, Spacing, Text, TextField } from '@/design-system';
import { DogIcon, LockIcon, MailIcon, UserIcon } from '@/design-system/icons';
import { useLoginForm } from '@/hooks/forms/useLoginForm';

import type { UserRole } from '@/schemas/user.schema';

import { AuthFormLayout } from './AuthFormLayout';
import { SelectButton } from './SelectButton';

const LOGIN_ROLES: {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  { value: 'PetSitter', label: '펫시터', description: '일자리 찾기', icon: <UserIcon size={24} /> },
  { value: 'PetOwner', label: '구인자', description: '펫시터 구하기', icon: <DogIcon size={24} /> },
];

/**
 * [Container + View] 로그인 폼 컴포넌트
 *
 * - 비즈니스 로직: useLoginForm 위임
 * - 역할: UI 렌더링만 담당
 */
export function LoginForm() {
  const navigate = useNavigate();
  const { register, onSubmit, errors, isPending, serverError, signupSuccess } = useLoginForm();
  const [selectedRole, setSelectedRole] = useState<UserRole>('PetSitter');

  return (
    <AuthFormLayout title="펫시터" subtitle="믿을 수 있는 펫시터 매칭 플랫폼">
      {/* 회원가입 성공 배너 */}
      {signupSuccess && (
        <>
          <p className="rounded-xl border border-green-200 bg-green-50 px-16 py-12 text-b2 text-green-700">
            회원가입이 완료되었습니다. 로그인해주세요.
          </p>
          <Spacing size={12} />
        </>
      )}

      {/* 서버 에러 배너 */}
      {serverError && (
        <>
          <p className="rounded-xl border border-red-200 bg-red-50 px-16 py-12 text-b2 text-danger">
            {serverError}
          </p>
          <Spacing size={12} />
        </>
      )}

      {/* 역할 선택 */}
      <Flex direction="column" gap={8} align="stretch">
        <Text as="label" size="b2" color="secondary">
          역할 선택
        </Text>
        <Flex gap={12}>
          {LOGIN_ROLES.map(({ value, label, description, icon }) => (
            <SelectButton
              key={value}
              isSelected={selectedRole === value}
              onClick={() => setSelectedRole(value)}
              icon={icon}
              label={label}
              description={description}
            />
          ))}
        </Flex>
      </Flex>

      <Spacing size={24} />

      {/* 로그인 폼 */}
      <form onSubmit={onSubmit}>
        <Flex direction="column" gap={16} align="stretch">
          <TextField
            label="이메일"
            type="email"
            autoComplete="email"
            placeholder="example@email.com"
            leftIcon={<MailIcon size={18} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <TextField
            label="비밀번호"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            leftIcon={<LockIcon size={18} />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Spacing size={4} />

          <Button type="submit" size="lg" isLoading={isPending} className="w-full">
            로그인
          </Button>
        </Flex>
      </form>

      <Spacing size={24} />

      {/* 회원가입 링크 */}
      <p className="text-center text-b2 text-text-secondary">
        계정이 없으신가요?{' '}
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="font-medium text-primary"
        >
          회원가입
        </button>
      </p>
    </AuthFormLayout>
  );
}
