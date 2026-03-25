import { z } from "zod";

// 서버 POST /sessions 응답 스키마
export const authPayloadSchema = z.object({
  user_id: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
});

// 서버 GET /users/:id 응답 스키마 (실제 서버 필드명 기준)
export const serverUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string(),
  roles: z.array(z.enum(["PetOwner", "PetSitter", "Admin"])),
  photos: z.array(z.object({ url: z.string() })),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const registerRequestSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
  full_name: z.string().min(1, "이름을 입력해주세요"),
  roles: z.array(z.enum(["PetOwner", "PetSitter"])).min(1),
});

export const loginRequestSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export type AuthPayload = z.infer<typeof authPayloadSchema>;
export type ServerUser = z.infer<typeof serverUserSchema>;
export type RegisterInput = z.infer<typeof registerRequestSchema>;
export type LoginInput = z.infer<typeof loginRequestSchema>;
