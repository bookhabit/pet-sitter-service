import { z } from 'zod';

/* ─── AuthPayload (POST /sessions 응답) ─────────────────────── */

export const authPayloadSchema = z.object({
  user_id: z.string().uuid(),
  accessToken: z.string(),   // 15분 단기 액세스 토큰
  refreshToken: z.string(),  // 7일 장기 리프레시 토큰
});

export type AuthPayload = z.infer<typeof authPayloadSchema>;

/* ─── LoginDto (요청 바디) ──────────────────────────────────── */

export const loginInputSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
