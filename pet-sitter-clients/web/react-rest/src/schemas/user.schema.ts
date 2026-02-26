import { z } from 'zod';

/* ─── 공통 ─────────────────────────────────────────────────── */

export const userRoleSchema = z.enum(['PetOwner', 'PetSitter', 'Admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const photoSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  file_name: z.string(),
  original_name: z.string(),
  mime_type: z.string(),
  size: z.number(),
  uploader_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  job_id: z.string().uuid().nullable(),
  pet_id: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
});

export type Photo = z.infer<typeof photoSchema>;

/* ─── UserModel (서버 응답) ─────────────────────────────────── */

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string(),
  roles: z.array(userRoleSchema),
  photos: z.array(photoSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;

/* ─── CreateUserDto (요청 바디) ─────────────────────────────── */

export const createUserInputSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  full_name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').max(50),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
  roles: z.array(userRoleSchema).min(1, '역할을 하나 이상 선택해주세요.'),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  email: z.string().email().optional(),
  full_name: z.string().max(20).optional(),
  password: z.string().min(8).max(20).optional(),
  roles: z.array(userRoleSchema).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
