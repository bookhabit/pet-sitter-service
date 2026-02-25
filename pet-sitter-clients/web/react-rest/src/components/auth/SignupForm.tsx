import { useNavigate } from 'react-router-dom';

import { Button, Flex, Spacing, Text, TextField } from '@/design-system';
import { useSignupForm } from '@/hooks/forms/useSignupForm';

import type { UserRole } from '@/schemas/user.schema';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'PetOwner', label: '펫 주인' },
  { value: 'PetSitter', label: '펫시터' },
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
    <Flex direction="column" align="center" className="min-h-dvh px-24">
      <Spacing size={64} />

      <Flex direction="column" className="w-full max-w-[40rem]">
        <Text as="h1" size="t1" className="text-center">
          회원가입
        </Text>

        <Spacing size={32} />

        {/* 서버 에러 배너 */}
        {serverError && (
          <p className="rounded-xl bg-red-50 border border-red-200 px-16 py-12 text-b2 text-danger">
            {serverError}
          </p>
        )}

        <Spacing size={24} />

        <form onSubmit={onSubmit}>
          <Flex direction="column" gap={16}>
            {/* 역할 선택 */}
            <Flex direction="column" gap={8}>
              <Text as="label" size="b2" color="secondary">
                역할 선택
              </Text>
              <Flex gap={12}>
                {ROLES.map(({ value, label }) => {
                  const isActive = selectedRole === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectRole(value)}
                      className={[
                        'flex-1 rounded-xl border-2 py-12 text-b2 font-bold transition-all',
                        isActive
                          ? 'border-primary bg-blue-50 text-primary'
                          : 'border-grey200 bg-background text-text-secondary hover:border-primary/40',
                      ].join(' ')}
                    >
                      {label}
                    </button>
                  );
                })}
              </Flex>
              {errors.roles && (
                <span className="text-caption text-danger">{errors.roles.message}</span>
              )}
            </Flex>

            <TextField
              label="이름"
              type="text"
              placeholder="김주인"
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <TextField
              label="이메일"
              type="email"
              autoComplete="email"
              placeholder="owner1@test.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <TextField
              label="비밀번호 (8자 이상)"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호 입력"
              error={errors.password?.message}
              {...register('password')}
            />

            <Spacing size={4} />

            <Button type="submit" size="lg" isLoading={isPending} className="w-full">
              회원가입
            </Button>
          </Flex>
        </form>

        <Spacing size={16} />

        <Button
          variant="ghost"
          size="md"
          className="w-full"
          onClick={() => navigate('/login')}
        >
          이미 계정이 있으신가요? 로그인
        </Button>
      </Flex>
    </Flex>
  );
}
