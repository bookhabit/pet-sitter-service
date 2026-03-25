import { z } from 'zod';

// 서버 응답 검증용 Zod 스키마
// 런타임에 서버 응답이 예상한 형태인지 검증 → 타입 안정성 보장
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  phone: z.string().nullable(),
  profileImage: z.string().nullable(),
  bio: z.string().nullable(),
  role: z.enum(['PetOwner', 'PetSitter', 'Admin']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const loginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: userSchema,
});

export const registerRequestSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  full_name: z.string().min(1, '이름을 입력해주세요'),
  roles: z.array(z.enum(['PetOwner', 'PetSitter'])).min(1),
});

export const loginRequestSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export type User = z.infer<typeof userSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RegisterInput = z.infer<typeof registerRequestSchema>;
export type LoginInput = z.infer<typeof loginRequestSchema>;
