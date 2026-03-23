import { LoginInput, loginResponseSchema, LoginResponse, RegisterInput } from '@/schemas/userSchema';
import { publicApi } from './http/publicApi';

// authService: 인증 관련 순수 API 호출만 담당
// React import 없음, 상태 관리 없음 → 순수 TypeScript 함수
export const authService = {
  // 로그인: POST /sessions
  login: async (data: LoginInput): Promise<LoginResponse> => {
    const res = await publicApi.post('/sessions', data);
    // Zod로 서버 응답 검증 — 예상치 못한 응답 구조 변경을 런타임에 감지
    return loginResponseSchema.parse(res.data);
  },

  // 회원가입: POST /users
  register: async (data: RegisterInput): Promise<void> => {
    await publicApi.post('/users', data);
  },

  // 로그아웃: DELETE /sessions (access_token 필요 → privateApi 사용)
  // privateApi는 순환 참조 방지를 위해 동적 import
  logout: async (): Promise<void> => {
    const { privateApi } = await import('./http/privateApi');
    await privateApi.delete('/sessions');
  },
};
