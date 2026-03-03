import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RoleGuard } from '@/guards/RoleGuard';
import { useCreateJobMutation } from '@/hooks/jobs';
import { useAuthStore } from '@/store/useAuthStore';
import { mockPetOwner, mockPetSitter } from '@/test/fixtures/job.fixtures';

import { JobWritePage } from '../JobWritePage';

// ─── mock ──────────────────────────────────────────────────────────────────

vi.mock('@/hooks/jobs', () => ({
  useCreateJobMutation: vi.fn(),
}));

const mockMutate = vi.fn();

function setupMock(overrides: Record<string, unknown> = {}) {
  vi.mocked(useCreateJobMutation).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
    error: null,
    ...overrides,
  } as unknown as ReturnType<typeof useCreateJobMutation>);
}

// ─── 렌더 헬퍼 ─────────────────────────────────────────────────────────────

/**
 * RoleGuard(['PetOwner']) 로 보호된 /jobs/write 라우트 렌더
 * user 파라미터로 인증 상태를 제어
 */
function renderJobWritePage(user = mockPetOwner) {
  useAuthStore.setState({ isAuthenticated: true, user });

  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter initialEntries={['/jobs/write']}>
        <Routes>
          <Route element={<RoleGuard allowedRoles={['PetOwner']} />}>
            <Route path="/jobs/write" element={<JobWritePage />} />
          </Route>
          <Route path="/jobs" element={<div>구인공고 목록</div>} />
          <Route path="/jobs/:jobId" element={<div>구인공고 상세</div>} />
        </Routes>
      </MemoryRouter>,
    ),
  };
}

/** 폼에서 필수 항목을 모두 채우는 헬퍼 */
async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
  await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
  await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');

  // 반려동물 1마리 추가
  await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
  await user.type(screen.getByLabelText('이름'), '뽀삐');
  await user.type(screen.getByLabelText('나이'), '3');
  await user.click(screen.getByRole('button', { name: 'Dog' }));
  await user.type(screen.getByLabelText('품종'), '말티즈');
}

// ─── tests ─────────────────────────────────────────────────────────────────

describe('[JOB-01] 구인공고 등록', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
    });
  });

  // ── JOB-01 | 접근 및 렌더링 ──────────────────────────────────────────────

  describe('JOB-01 | 접근 및 렌더링', () => {
    it('JOB-01-001: PetSitter가 등록 페이지 접근 — RoleGuard에 의해 목록으로 리다이렉트된다', () => {
      setupMock();
      renderJobWritePage(mockPetSitter);

      expect(screen.getByText('구인공고 목록')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: '구인공고 등록' })).not.toBeInTheDocument();
    });

    it('JOB-01-002: PetOwner가 등록 페이지 접근 — 구인공고 등록 폼이 표시된다', () => {
      setupMock();
      renderJobWritePage(mockPetOwner);

      expect(screen.getByRole('heading', { name: '구인공고 등록' })).toBeInTheDocument();
      expect(screen.getByLabelText('시작 일시')).toBeInTheDocument();
      expect(screen.getByLabelText('종료 일시')).toBeInTheDocument();
      expect(screen.getByLabelText('내용')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '반려동물 추가' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '등록' })).toBeInTheDocument();
    });
  });

  // ── JOB-01 | 돌봄 일정 유효성 ───────────────────────────────────────────

  describe('JOB-01 | 돌봄 일정 유효성', () => {
    it('JOB-01-003: 시작 일시 미입력 — 오류 메시지가 표시되고 등록이 진행되지 않는다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      // 시작 일시만 비워두고 제출
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      await user.type(screen.getByLabelText('나이'), '3');
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('시작 일시를 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-004: 종료 일시 미입력 — 오류 메시지가 표시되고 등록이 진행되지 않는다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      // 종료 일시 비워두기
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      await user.type(screen.getByLabelText('나이'), '3');
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('종료 일시를 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-005: 종료 일시가 시작 일시보다 빠른 경우 — 오류 메시지가 표시되고 등록이 진행되지 않는다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T09:00'); // 시작보다 이전
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      await user.type(screen.getByLabelText('나이'), '3');
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('종료 일시는 시작 일시 이후여야 합니다.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-006: 종료 일시가 시작 일시와 동일한 경우 — 오류 메시지가 표시되고 등록이 진행되지 않는다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T09:00'); // 동일
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      await user.type(screen.getByLabelText('나이'), '3');
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('종료 일시는 시작 일시 이후여야 합니다.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  // ── JOB-01 | 돌봄 내용 유효성 ───────────────────────────────────────────

  describe('JOB-01 | 돌봄 내용 유효성', () => {
    it('JOB-01-007: 돌봄 내용 미입력 — 오류 메시지가 표시되고 등록이 진행되지 않는다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      // 내용 비워두기
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      await user.type(screen.getByLabelText('나이'), '3');
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('내용을 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-008: 돌봄 내용 4자 이하 입력 — 최소 길이 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '산책'); // 2자 (4자 이하)
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      await user.type(screen.getByLabelText('나이'), '3');
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('내용은 5자 이상 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-009: 돌봄 내용 501자 이상 입력 — 최대 길이 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), 'a'.repeat(501));
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      await user.type(screen.getByLabelText('나이'), '3');
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('내용은 500자 이하로 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  // ── JOB-01 | 반려동물 정보 유효성 ───────────────────────────────────────

  describe('JOB-01 | 반려동물 정보 유효성', () => {
    it('JOB-01-010: 반려동물 미추가 — 오류 메시지가 표시되고 등록이 진행되지 않는다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      // 반려동물 추가하지 않음

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('반려동물을 1마리 이상 추가해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-011: 반려동물 이름 미입력 — 오류 메시지가 표시되고 등록이 진행되지 않는다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      // 이름 비워두기
      await user.type(screen.getByLabelText('나이'), '3');
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('이름을 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-012: 반려동물 이름 1자 입력 — 최소 길이 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀'); // 1자
      await user.type(screen.getByLabelText('나이'), '3');
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('이름은 2자 이상 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-013: 반려동물 이름 21자 이상 입력 — 최대 길이 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), 'a'.repeat(21)); // 21자
      await user.type(screen.getByLabelText('나이'), '3');
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('이름은 20자 이하로 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-014: 반려동물 나이 미입력 — 오류 메시지가 표시되고 등록이 진행되지 않는다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      // 나이 비워두기
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('나이를 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-015: 반려동물 나이 0 이하 입력 — 범위 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      await user.type(screen.getByLabelText('나이'), '0'); // 0 이하
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('나이는 1~100 사이로 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-015: 반려동물 나이 101 이상 입력 — 범위 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      await user.type(screen.getByLabelText('나이'), '101'); // 101 이상
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('나이는 1~100 사이로 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-016: 반려동물 종(species) 미선택 — 오류 메시지가 표시되고 등록이 진행되지 않는다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      await user.type(screen.getByLabelText('나이'), '3');
      // 종 미선택
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('동물 종을 선택해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-017: 반려동물 품종 미입력 — 오류 메시지가 표시되고 등록이 진행되지 않는다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      await user.type(screen.getByLabelText('나이'), '3');
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      // 품종 비워두기

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('품종을 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  // ── JOB-01 | 선택 항목 유효성 ───────────────────────────────────────────

  describe('JOB-01 | 선택 항목 유효성', () => {
    it('JOB-01-018: 가격 입력 후 가격 단위 미선택 — 가격 단위 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await fillRequiredFields(user);
      await user.type(screen.getByLabelText('가격'), '20000'); // 가격만 입력
      // 가격 단위(hourly/daily) 선택하지 않음

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('가격 단위를 선택해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-019: 가격 단위 선택 후 가격 미입력 — 가격 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await fillRequiredFields(user);
      // 가격은 입력하지 않고 단위만 선택
      await user.click(screen.getByRole('button', { name: '시간당' }));

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('가격을 입력해주세요.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('JOB-01-020: 가격에 음수 입력 — 가격 오류 메시지가 표시된다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await fillRequiredFields(user);
      await user.type(screen.getByLabelText('가격'), '-1000');
      await user.click(screen.getByRole('button', { name: '시간당' }));

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(screen.getByText('가격은 0 이상이어야 합니다.')).toBeInTheDocument();
      });
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  // ── JOB-01 | 등록 성공 ───────────────────────────────────────────────────

  describe('JOB-01 | 등록 성공', () => {
    it('JOB-01-021: 필수 항목만 입력 후 등록 — mutate가 올바른 데이터로 호출된다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(screen.getByLabelText('이름'), '뽀삐');
      await user.type(screen.getByLabelText('나이'), '3');
      await user.click(screen.getByRole('button', { name: 'Dog' }));
      await user.type(screen.getByLabelText('품종'), '말티즈');

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            start_time: '2024-06-01T09:00',
            end_time: '2024-06-01T18:00',
            activity: '강아지 산책 및 돌봄을 부탁드립니다.',
            pets: [
              expect.objectContaining({
                name: '뽀삐',
                age: 3,
                species: 'Dog',
                breed: '말티즈',
              }),
            ],
          }),
        );
      });
    });

    it('JOB-01-021: 등록 요청 중 — 제출 버튼이 로딩 상태로 표시되고 중복 클릭이 방지된다', async () => {
      setupMock({ isPending: true });
      renderJobWritePage();

      const submitBtn = screen.getByRole('button', { name: '등록' });
      expect(submitBtn).toBeDisabled();
    });

    it('JOB-01-022: 선택 항목 포함 전체 입력 후 등록 — mutate가 선택 항목을 포함한 데이터로 호출된다', async () => {
      setupMock();
      const { user } = renderJobWritePage();

      await user.type(screen.getByLabelText('시작 일시'), '2024-06-01T09:00');
      await user.type(screen.getByLabelText('종료 일시'), '2024-06-01T18:00');
      await user.type(screen.getByLabelText('내용'), '강아지 산책 및 돌봄을 부탁드립니다.');

      // 반려동물 2마리 추가
      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      const nameInputs = screen.getAllByLabelText('이름');
      const ageInputs = screen.getAllByLabelText('나이');
      const breedInputs = screen.getAllByLabelText('품종');

      await user.type(nameInputs[0], '뽀삐');
      await user.type(ageInputs[0], '3');
      await user.click(screen.getAllByRole('button', { name: 'Dog' })[0]);
      await user.type(breedInputs[0], '말티즈');

      await user.click(screen.getByRole('button', { name: '반려동물 추가' }));
      await user.type(nameInputs[1], '나비');
      await user.type(ageInputs[1], '5');
      await user.click(screen.getAllByRole('button', { name: 'Cat' })[0]);
      await user.type(breedInputs[1], '페르시안');

      // 선택 항목
      await user.type(screen.getByLabelText('주소'), '서울시 강남구');
      await user.type(screen.getByLabelText('가격'), '20000');
      await user.click(screen.getByRole('button', { name: '시간당' }));

      await user.click(screen.getByRole('button', { name: '등록' }));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            activity: '강아지 산책 및 돌봄을 부탁드립니다.',
            address: '서울시 강남구',
            price: 20000,
            price_type: 'hourly',
            pets: expect.arrayContaining([
              expect.objectContaining({ name: '뽀삐', species: 'Dog' }),
              expect.objectContaining({ name: '나비', species: 'Cat' }),
            ]),
          }),
        );
      });
    });
  });

  // ── JOB-01 | 등록 API 오류 ──────────────────────────────────────────────

  describe('JOB-01 | 등록 API 오류', () => {
    it('JOB-01-023: 서버 오류(500) — 오류 메시지가 표시되고 등록 버튼이 다시 활성화된다', () => {
      setupMock({ error: { response: { status: 500 } } });
      renderJobWritePage();

      expect(screen.getByText('구인공고 등록 중 오류가 발생했습니다.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '등록' })).not.toBeDisabled();
    });

    it('JOB-01-024: 네트워크 오류 — 오류 메시지가 표시되고 앱이 중단되지 않는다', () => {
      setupMock({ error: new Error('Network Error') });
      renderJobWritePage();

      expect(screen.getByText('구인공고 등록 중 오류가 발생했습니다.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '등록' })).not.toBeDisabled();
    });

    it('JOB-01-025: 권한 없음 오류(403) — 오류 메시지가 표시되고 앱이 중단되지 않는다', () => {
      setupMock({ error: { response: { status: 403 } } });
      renderJobWritePage();

      expect(screen.getByText('구인공고 등록 권한이 없습니다.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '등록' })).not.toBeDisabled();
    });
  });
});
