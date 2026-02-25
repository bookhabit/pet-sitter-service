import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '../schemas/user.schema';

// re-export for convenience
export type { User };

interface AuthState {
  /** 로그인한 사용자 정보 (서버 UserModel) */
  user: User | null;

  /** 요청 인터셉터에서 사용하는 raw JWT (Bearer 접두사 제거) */
  token: string | null;

  /** POST /sessions/refresh 로 재발급 요청 시 사용하는 토큰 (로그인 시 token과 동일 값) */
  refreshToken: string | null;

  isAuthenticated: boolean;

  /** 로그인 성공 후 상태 확정 */
  setAuth: (token: string, refreshToken: string | null, user: User) => void;

  /** 로그아웃 / 401 만료 시 상태 초기화 */
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (token, refreshToken, user) =>
        set({ token, refreshToken, user, isAuthenticated: true }),

      clearAuth: () =>
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' },
  ),
);
