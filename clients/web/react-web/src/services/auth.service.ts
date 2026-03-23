import { http } from '../api/axios-instance';

import type { AuthPayload, LoginInput } from '../schemas/auth.schema';
import { authPayloadSchema } from '../schemas/auth.schema';

export const authService = {
  /** POST /sessions — 로그인: { user_id, accessToken, refreshToken } 반환 */
  login: (data: LoginInput): Promise<AuthPayload> =>
    http.auth.post<AuthPayload>('/sessions', data, authPayloadSchema),

  /** DELETE /sessions — 로그아웃: 서버 세션 삭제 */
  logout: (): Promise<void> => http.delete<void>('/sessions'),
};
