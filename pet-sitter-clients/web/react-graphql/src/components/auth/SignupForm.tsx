import { useNavigate } from 'react-router-dom';

import { Button, Flex, Spacing, Text, TextField } from '@/design-system';
import { DogIcon, LockIcon, MailIcon, UserIcon } from '@/design-system/icons';
import { useSignupForm } from '@/hooks/forms/useSignupForm';

import type { UserRole } from '@/schemas/user.schema';

import { AuthFormLayout } from './AuthFormLayout';
import { SelectButton } from './SelectButton';

const SIGNUP_ROLES: {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  { value: 'PetSitter', label: '펫시터', description: '일자리 찾기', icon: <UserIcon size={24} /> },
  { value: 'PetOwner', label: '구인자', description: '펫시터 구하기', icon: <DogIcon size={24} /> },
];

/**
 * [Container + View] 회원가입 폼 컴포넌트
 *
 * - 비즈니스 로직: useSignupForm 위임
 * - 역할: UI 렌더링만 담당
 */
export function SignupForm() {
  const navigate = useNavigate();
  const { register, onSubmit, errors, isPending, serverError, selectedRole, selectRole } =
    useSignupForm();

  return (
    <AuthFormLayout title="펫시터" subtitle="회원가입하고 시작하세요">
      {/* 서버 에러 배너 */}
      {serverError && (
        <>
          <p className="rounded-xl border border-red-200 bg-red-50 px-16 py-12 text-b2 text-danger">
            {serverError}
          </p>
          <Spacing size={12} />
        </>
      )}

      {/* 가입 유형 선택 */}
      <Flex direction="column" gap={8} align="stretch">
        <Text as="label" size="b2" color="secondary">
          가입 유형 선택
        </Text>
        <Flex gap={12}>
          {SIGNUP_ROLES.map(({ value, label, description, icon }) => (
            <SelectButton
              key={value}
              isSelected={selectedRole === value}
              onClick={() => selectRole(value)}
              icon={icon}
              label={label}
              description={description}
            />
          ))}
        </Flex>
        {errors.roles && <span className="text-caption text-danger">{errors.roles.message}</span>}
      </Flex>

      <Spacing size={24} />

      {/* 회원가입 폼 */}
      <form onSubmit={onSubmit}>
        <Flex direction="column" gap={16} align="stretch">
          <TextField
            label="이름"
            type="text"
            placeholder="홍길동"
            leftIcon={<UserIcon size={18} />}
            error={errors.full_name?.message}
            {...register('full_name')}
          />

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
            autoComplete="new-password"
            placeholder="••••••••"
            leftIcon={<LockIcon size={18} />}
            error={errors.password?.message}
            {...register('password')}
          />

          <TextField
            label="비밀번호 확인"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            leftIcon={<LockIcon size={18} />}
            error={errors.password_confirm?.message}
            {...register('password_confirm')}
          />

          <Spacing size={4} />

          <Button type="submit" size="lg" isLoading={isPending} className="w-full">
            회원가입
          </Button>
        </Flex>
      </form>

      <Spacing size={16} />

      {/* 로그인 링크 */}
      <p className="text-center text-b2 text-text-secondary">
        이미 계정이 있으신가요?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="font-medium text-primary"
        >
          로그인
        </button>
      </p>
    </AuthFormLayout>
  );
}
