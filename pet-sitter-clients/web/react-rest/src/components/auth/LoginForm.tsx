import { useNavigate } from 'react-router-dom';

import { Button, Flex, Spacing, Text, TextField } from '@/design-system';
import { useLoginForm } from '@/hooks/forms/useLoginForm';

/**
 * [Container + View] 로그인 폼 컴포넌트
 *
 * - 비즈니스 로직: useLoginForm 위임
 * - 역할: UI 렌더링만 담당
 */
export function LoginForm() {
  const navigate = useNavigate();
  const { register, onSubmit, errors, isPending, serverError, signupSuccess } = useLoginForm();

  return (
    <Flex direction="column" align="center" className="min-h-dvh px-24">
      <Spacing size={64} />

      <Flex direction="column" className="w-full max-w-[40rem]">
        <Text as="h1" size="t1" className="text-center">
          로그인
        </Text>

        <Spacing size={32} />

        {/* 회원가입 성공 배너 */}
        {signupSuccess && (
          <p className="text-b2 rounded-xl border border-green-200 bg-green-50 px-16 py-12 text-green-700">
            회원가입이 완료되었습니다. 로그인해주세요.
          </p>
        )}

        {/* 서버 에러 배너 */}
        {serverError && (
          <>
            {signupSuccess && <Spacing size={8} />}
            <p className="text-b2 text-danger rounded-xl border border-red-200 bg-red-50 px-16 py-12">
              {serverError}
            </p>
          </>
        )}

        <Spacing size={24} />

        <form onSubmit={onSubmit}>
          <Flex direction="column" gap={16}>
            <TextField
              label="이메일"
              type="email"
              autoComplete="email"
              placeholder="owner1@test.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <TextField
              label="비밀번호"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호 입력"
              error={errors.password?.message}
              {...register('password')}
            />

            <Spacing size={4} />

            <Button type="submit" size="lg" isLoading={isPending} className="w-full">
              로그인
            </Button>
          </Flex>
        </form>

        <Spacing size={16} />

        <Button variant="ghost" size="md" className="w-full" onClick={() => navigate('/signup')}>
          계정이 없으신가요? 회원가입
        </Button>
      </Flex>
    </Flex>
  );
}
