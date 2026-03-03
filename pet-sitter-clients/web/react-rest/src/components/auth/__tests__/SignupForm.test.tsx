import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GuestGuard } from '@/guards/GuestGuard';
import { useSignupMutation } from '@/hooks/auth';
import { useAuthStore } from '@/store/useAuthStore';

import { SignupForm } from '../SignupForm';

// ─── mock ──────────────────────────────────────────────────────────────────
vi.mock('@/hooks/auth', () => ({
  useSignupMutation: vi.fn(),
}));

const mockMutate = vi.fn();

function setupMock(overrides: Record<string, unknown> = {}) {
  vi.mocked(useSignupMutation).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    error: null,
    ...overrides,
  } as unknown as ReturnType<typeof useSignupMutation>);
}

function renderSignupForm() {
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>,
    ),
  };
}

// 유효한 폼을 채우는 헬퍼
async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('이름'), '김주인');
  await user.type(screen.getByLabelText('이메일'), 'owner@test.com');
  await user.type(screen.getByLabelText('비밀번호 (8자 이상)'), 'password123');
}

// ─── tests ─────────────────────────────────────────────────────────────────

describe('[SIGN] 회원가입', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
    });
  });

  // ── SIGN-01 | 페이지 접근 ──────────────────────────────────────────────

  describe('SIGN-01 | 페이지 접근', () => {
    it('SIGN-01-001: 비로그인 사용자의 회원가입 페이지 접근 — 회원가입 폼이 표시된다', () => {
      setupMock();
      renderSignupForm();

      expect(screen.getByRole('heading', { name: '회원가입' })).toBeInTheDocument();
      expect(screen.getByLabelText('이름')).toBeInTheDocument();
      expect(screen.getByLabelText('이메일')).toBeInTheDocument();
      expect(screen.getByLabelText('비밀번호 (8자 이상)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '펫 주인' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '펫시터' })).toBeInTheDocument();
    });

    it('SIGN-01-002: 이미 로그인한 사용자의 회원가입 페이지 접근 — 다른 페이지로 이동된다', () => {
      setupMock();
      useAuthStore.setState({ isAuthenticated: true });

      render(
        <MemoryRouter initialEntries={['/signup']}>
          <Routes>
            <Route element={<GuestGuard />}>
              <Route path="/signup" element={<SignupForm />} />
            </Route>
            <Route path="/jobs" element={<div>구인공고 목록</div>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getByText('구인공고 목록')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: '회원가입' })).not.toBeInTheDocument();
    });
  });

  // ── SIGN-02 | 역할 선택 ───────────────────────────────────────────────

  describe('SIGN-02 | 역할 선택', () => {
    it('SIGN-02-001: PetOwner 역할 선택 — 버튼이 선택된 상태로 표시된다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      const petOwnerBtn = screen.getByRole('button', { name: '펫 주인' });
      await user.click(petOwnerBtn);

      // 선택된 버튼은 bg-blue-50(활성), 미선택 버튼은 border-grey200(비활성)
      expect(petOwnerBtn.className).toContain('bg-blue-50');
    });

    it('SIGN-02-002: PetSitter 역할 선택 — 버튼이 선택된 상태로 표시된다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      const petSitterBtn = screen.getByRole('button', { name: '펫시터' });
      await user.click(petSitterBtn);

      expect(petSitterBtn.className).toContain('bg-blue-50');
    });

    it('SIGN-02-003: 역할 변경 — PetSitter만 선택된 상태로 변경된다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      const petOwnerBtn = screen.getByRole('button', { name: '펫 주인' });
      const petSitterBtn = screen.getByRole('button', { name: '펫시터' });

      // PetOwner 선택 후 PetSitter로 변경
      await user.click(petOwnerBtn);
      await user.click(petSitterBtn);

      // PetSitter: 활성 (bg-blue-50), PetOwner: 비활성 (border-grey200)
      expect(petSitterBtn.className).toContain('bg-blue-50');
      expect(petOwnerBtn.className).toContain('border-grey200');
    });
  });

  // ── SIGN-03 | 이름 입력 유효성 검사 ───────────────────────────────────

  describe('SIGN-03 | 이름 입력 유효성 검사', () => {
    it('SIGN-03-001: 이름 최소 길이 미달 (1자) — 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      await user.type(screen.getByLabelText('이름'), 'a');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('이름은 최소 2자 이상이어야 합니다.')).toBeInTheDocument();
      });
      expect(screen.getByLabelText('이름')).toHaveAttribute('aria-invalid', 'true');
    });

    it('SIGN-03-002: 이름 최소 길이 충족 (2자) — 유효성을 통과한다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      await user.type(screen.getByLabelText('이름'), '김주');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByLabelText('이름')).toHaveAttribute('aria-invalid', 'false');
      });
    });

    it('SIGN-03-003: 이름 최대 길이 초과 (51자) — 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      await user.type(screen.getByLabelText('이름'), 'a'.repeat(51));
      await user.tab();

      await waitFor(() => {
        expect(screen.getByLabelText('이름')).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  // ── SIGN-04 | 이메일 입력 유효성 검사 ─────────────────────────────────

  describe('SIGN-04 | 이메일 입력 유효성 검사', () => {
    it('SIGN-04-001: 올바르지 않은 이메일 형식 — 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      await user.type(screen.getByLabelText('이메일'), 'notanemail');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('유효한 이메일을 입력해주세요.')).toBeInTheDocument();
      });
      expect(screen.getByLabelText('이메일')).toHaveAttribute('aria-invalid', 'true');
    });

    it('SIGN-04-002: 올바른 이메일 형식 — 유효성을 통과한다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      await user.type(screen.getByLabelText('이메일'), 'owner@test.com');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByLabelText('이메일')).toHaveAttribute('aria-invalid', 'false');
      });
    });
  });

  // ── SIGN-05 | 비밀번호 입력 유효성 검사 ───────────────────────────────

  describe('SIGN-05 | 비밀번호 입력 유효성 검사', () => {
    it('SIGN-05-001: 비밀번호 최소 길이 미달 (7자 이하) — 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      await user.type(screen.getByLabelText('비밀번호 (8자 이상)'), '1234567');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('비밀번호는 최소 8자 이상이어야 합니다.')).toBeInTheDocument();
      });
      expect(screen.getByLabelText('비밀번호 (8자 이상)')).toHaveAttribute('aria-invalid', 'true');
    });

    it('SIGN-05-002: 비밀번호 최소 길이 충족 (8자 이상) — 유효성을 통과한다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      await user.type(screen.getByLabelText('비밀번호 (8자 이상)'), '12345678');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByLabelText('비밀번호 (8자 이상)')).toHaveAttribute(
          'aria-invalid',
          'false',
        );
      });
    });
  });

  // ── SIGN-06 | 폼 제출 ──────────────────────────────────────────────────

  describe('SIGN-06 | 폼 제출', () => {
    it('SIGN-06-001: 유효하지 않은 입력으로 제출 — 서버로 요청이 전송되지 않는다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      // 아무것도 입력하지 않고 제출
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(mockMutate).not.toHaveBeenCalled();
      });
    });

    it('SIGN-06-002: 모든 입력이 유효한 상태에서 제출 — 서버로 요청이 전송된다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      // PetSitter 선택
      await user.click(screen.getByRole('button', { name: '펫시터' }));
      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          roles: ['PetSitter'],
          full_name: '김주인',
          email: 'owner@test.com',
          password: 'password123',
        });
      });
    });

    it('SIGN-06-002: 기본 PetOwner 선택 상태에서 제출 — PetOwner roles로 요청이 전송된다', async () => {
      setupMock();
      const { user } = renderSignupForm();

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ roles: ['PetOwner'] }));
      });
    });

    it('SIGN-06-003: 요청 중 중복 제출 방지 — 제출 버튼이 비활성화된다', () => {
      setupMock({ isPending: true });
      const { container } = renderSignupForm();

      // isPending=true 시 Button 컴포넌트는 disabled 속성을 추가하고 "로딩 중..." 텍스트를 표시
      const submitBtn = container.querySelector('button[type="submit"]');
      expect(submitBtn).toBeDisabled();
    });
  });

  // ── SIGN-07 | 회원가입 성공 ────────────────────────────────────────────

  describe('SIGN-07 | 회원가입 성공', () => {
    /**
     * SIGN-07-001: 회원가입 성공 후 /login 이동
     * useSignupMutation.onSuccess 내부에서 navigate('/login', { state: { signupSuccess: true } }) 호출
     * → 해당 동작은 AUTH-01-003 (로그인 페이지 진입 시 안내 메시지)으로 검증
     */
    it('SIGN-07-001: 회원가입 성공 시 mutate가 호출된다 (navigate 검증은 useSignupMutation 훅 테스트에서)', async () => {
      setupMock();
      const { user } = renderSignupForm();

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: '회원가입' }));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ── SIGN-08 | 회원가입 실패 ────────────────────────────────────────────

  describe('SIGN-08 | 회원가입 실패', () => {
    it('SIGN-08-001: 이미 가입된 이메일 (409) — "이미 사용 중인 이메일입니다." 안내 메시지가 표시된다', () => {
      setupMock({ error: { response: { status: 409 } } });
      renderSignupForm();

      expect(screen.getByText('이미 사용 중인 이메일입니다.')).toBeInTheDocument();
    });

    it('SIGN-08-002: 네트워크 오류 — 오류 메시지가 표시되고 앱이 중단되지 않는다', () => {
      setupMock({ error: new Error('Network Error') });
      renderSignupForm();

      expect(screen.getByText('회원가입 중 오류가 발생했습니다.')).toBeInTheDocument();
      // 회원가입 버튼은 여전히 활성 상태
      expect(screen.getByRole('button', { name: '회원가입' })).not.toBeDisabled();
    });

    it('SIGN-08-003: 서버 오류 (400) — 오류 메시지가 표시되고 다시 시도할 수 있는 상태가 유지된다', () => {
      setupMock({ error: { response: { status: 400 } } });
      renderSignupForm();

      expect(screen.getByText('입력 정보를 확인해주세요.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '회원가입' })).not.toBeDisabled();
    });
  });
});
