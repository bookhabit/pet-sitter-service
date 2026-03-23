import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthGuard } from '@/guards/AuthGuard';
import { GuestGuard } from '@/guards/GuestGuard';
import { useLoginMutation } from '@/hooks/auth';
import { useAuthStore } from '@/store/useAuthStore';

import { LoginForm } from '../LoginForm';

// ─── mock ──────────────────────────────────────────────────────────────────
vi.mock('@/hooks/auth', () => ({
  useLoginMutation: vi.fn(),
}));

const mockMutate = vi.fn();

function setupMock(overrides: Record<string, unknown> = {}) {
  vi.mocked(useLoginMutation).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    error: null,
    ...overrides,
  } as unknown as ReturnType<typeof useLoginMutation>);
}

/** 기본 렌더링 — location.state 없음 */
function renderLoginForm(locationState?: Record<string, unknown>) {
  const initialEntry = locationState ? { pathname: '/login', state: locationState } : '/login';

  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </MemoryRouter>,
    ),
  };
}

// ─── tests ─────────────────────────────────────────────────────────────────

describe('[AUTH] 로그인 / 인증', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
    });
  });

  // ── AUTH-01 | 페이지 접근 ─────────────────────────────────────────────

  describe('AUTH-01 | 페이지 접근', () => {
    it('AUTH-01-001: 비로그인 사용자의 로그인 페이지 접근 — 로그인 폼이 표시된다', () => {
      setupMock();
      renderLoginForm();

      expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    it('AUTH-01-002: 이미 로그인한 사용자의 로그인 페이지 접근 — 다른 페이지로 이동된다', () => {
      setupMock();
      useAuthStore.setState({ isAuthenticated: true });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route element={<GuestGuard />}>
              <Route path="/login" element={<LoginForm />} />
            </Route>
            <Route path="/jobs" element={<div>구인공고 목록</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('구인공고 목록')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: '로그인' })).not.toBeInTheDocument();
    });

    it('AUTH-01-003: 회원가입 완료 후 로그인 페이지 진입 — 회원가입 완료 안내 메시지가 표시된다', () => {
      setupMock();
      // useSignupMutation.onSuccess 에서 navigate('/login', { state: { signupSuccess: true } }) 전달
      renderLoginForm({ signupSuccess: true });

      expect(screen.getByText('회원가입이 완료되었습니다. 로그인해주세요.')).toBeInTheDocument();
    });

    it('AUTH-01-004: 로그인 폼에 회원가입 페이지 링크가 표시된다', () => {
      setupMock();
      renderLoginForm();

      expect(
        screen.getByRole('button', { name: '계정이 없으신가요? 회원가입' }),
      ).toBeInTheDocument();
    });
  });

  // ── AUTH-02 | 입력 유효성 검사 ────────────────────────────────────────

  describe('AUTH-02 | 입력 유효성 검사', () => {
    it('AUTH-02-001: 올바르지 않은 이메일 형식 — 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderLoginForm();

      await user.type(screen.getByLabelText('이메일'), 'notanemail');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('유효한 이메일을 입력해주세요.')).toBeInTheDocument();
      });
      expect(screen.getByLabelText('이메일')).toHaveAttribute('aria-invalid', 'true');
    });

    it('AUTH-02-002: 올바른 이메일 형식 — 유효성을 통과한다', async () => {
      setupMock();
      const { user } = renderLoginForm();

      await user.type(screen.getByLabelText('이메일'), 'user@test.com');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByLabelText('이메일')).toHaveAttribute('aria-invalid', 'false');
      });
    });

    it('AUTH-02-003: 비밀번호 미입력 — 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderLoginForm();

      // 비밀번호 필드를 클릭 후 바로 tab (빈 상태로 blur)
      await user.click(screen.getByLabelText('비밀번호'));
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
      });
      expect(screen.getByLabelText('비밀번호')).toHaveAttribute('aria-invalid', 'true');
    });

    it('AUTH-02-004: 비밀번호 입력 — 유효성을 통과한다', async () => {
      setupMock();
      const { user } = renderLoginForm();

      await user.type(screen.getByLabelText('비밀번호'), 'anypassword');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByLabelText('비밀번호')).toHaveAttribute('aria-invalid', 'false');
      });
    });
  });

  // ── AUTH-03 | 폼 제출 ─────────────────────────────────────────────────

  describe('AUTH-03 | 폼 제출', () => {
    it('AUTH-03-001: 유효하지 않은 입력으로 제출 — 서버로 요청이 전송되지 않는다', async () => {
      setupMock();
      const { user } = renderLoginForm();

      // 아무것도 입력하지 않고 제출
      await user.click(screen.getByRole('button', { name: '로그인' }));

      await waitFor(() => {
        expect(mockMutate).not.toHaveBeenCalled();
      });
    });

    it('AUTH-03-002: 유효한 입력으로 제출 — 서버로 요청이 전송된다', async () => {
      setupMock();
      const { user } = renderLoginForm();

      await user.type(screen.getByLabelText('이메일'), 'user@test.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: '로그인' }));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          email: 'user@test.com',
          password: 'password123',
        });
      });
    });

    it('AUTH-03-003: 요청 중 중복 제출 방지 — 제출 버튼이 비활성화된다', () => {
      setupMock({ isPending: true });
      const { container } = renderLoginForm();

      // isPending=true 시 Button 컴포넌트는 disabled 속성을 추가하고 "로딩 중..." 텍스트를 표시
      const submitBtn = container.querySelector('button[type="submit"]');
      expect(submitBtn).toBeDisabled();
    });
  });

  // ── AUTH-04 | 로그인 성공 ─────────────────────────────────────────────

  describe('AUTH-04 | 로그인 성공', () => {
    /**
     * AUTH-04-001: 로그인 성공 후 /jobs 이동
     * useLoginMutation.onSuccess 내부에서 navigate('/jobs', { replace: true }) 호출
     * → 라우터/훅 레벨 동작이므로 useLoginMutation 훅 단위 테스트에서 검증
     *
     * AUTH-04-002: 로그인 상태 유지
     * useAuthStore.setAuth()로 Zustand + localStorage 저장
     * → useLoginMutation 훅 단위 테스트에서 검증
     */
    it('AUTH-04-001/002: 로그인 성공 시 mutate가 올바른 데이터로 호출된다', async () => {
      setupMock();
      const { user } = renderLoginForm();

      await user.type(screen.getByLabelText('이메일'), 'user@test.com');
      await user.type(screen.getByLabelText('비밀번호'), 'password123');
      await user.click(screen.getByRole('button', { name: '로그인' }));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith({
          email: 'user@test.com',
          password: 'password123',
        });
      });
    });
  });

  // ── AUTH-05 | 로그인 실패 ─────────────────────────────────────────────

  describe('AUTH-05 | 로그인 실패', () => {
    it('AUTH-05-001: 존재하지 않는 이메일 (401) — "이메일 또는 비밀번호가 올바르지 않습니다." 메시지 표시', () => {
      setupMock({ error: { response: { status: 401 } } });
      renderLoginForm();

      expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
    });

    it('AUTH-05-002: 비밀번호 불일치 (401) — "이메일 또는 비밀번호가 올바르지 않습니다." 메시지 표시', () => {
      setupMock({ error: { response: { status: 401 } } });
      renderLoginForm();

      expect(screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeInTheDocument();
    });

    it('AUTH-05-003: 네트워크 오류 — 오류 메시지가 표시되고 앱이 중단되지 않는다', () => {
      setupMock({ error: new Error('Network Error') });
      renderLoginForm();

      expect(screen.getByText('로그인 중 오류가 발생했습니다.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '로그인' })).not.toBeDisabled();
    });

    it('AUTH-05-004: 서버 오류 (500) — 오류 메시지가 표시되고 다시 시도할 수 있는 상태가 유지된다', () => {
      setupMock({ error: { response: { status: 500 } } });
      renderLoginForm();

      expect(screen.getByText('로그인 중 오류가 발생했습니다.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '로그인' })).not.toBeDisabled();
    });
  });

  // ── AUTH-06 | 로그아웃 ────────────────────────────────────────────────

  describe('AUTH-06 | 로그아웃', () => {
    /**
     * AUTH-06-001: 로그아웃 버튼 클릭 → useLogoutMutation.onSuccess 에서 clearAuth() + navigate('/login')
     * → 로그아웃 버튼은 MainLayout/Header 컴포넌트에 위치
     *    해당 컴포넌트 테스트에서 검증 (useLogoutMutation mock 사용)
     */

    it('AUTH-06-002: 로그아웃 후 보호된 페이지 접근 — 로그인 페이지로 이동된다', () => {
      setupMock();
      // isAuthenticated: false 상태 (clearAuth 이후)
      useAuthStore.setState({ isAuthenticated: false });

      render(
        <MemoryRouter initialEntries={['/jobs']}>
          <Routes>
            <Route element={<AuthGuard />}>
              <Route path="/jobs" element={<div>구인공고 목록</div>} />
            </Route>
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </MemoryRouter>,
      );

      // AuthGuard가 미인증 사용자를 /login 으로 리다이렉트
      expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
      expect(screen.queryByText('구인공고 목록')).not.toBeInTheDocument();
    });
  });
});
