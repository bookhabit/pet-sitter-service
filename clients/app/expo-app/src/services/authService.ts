import {
  LoginInput,
  authPayloadSchema,
  serverUserSchema,
  RegisterInput,
} from "@/schemas/userSchema";
import { publicApi } from "./http/publicApi";

// authService: 인증 관련 순수 API 호출만 담당
// React import 없음, 상태 관리 없음 → 순수 TypeScript 함수

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: "PetOwner" | "PetSitter" | "Admin";
    profileImage: string | null;
  };
}

export const authService = {
  // 로그인: POST /sessions → GET /users/:id 2단계 호출
  // 1. POST /sessions → { user_id, accessToken, refreshToken }
  // 2. GET /users/:user_id (토큰 헤더 포함) → user 상세 정보
  // 3. 서버 필드(full_name, roles[], photos[]) → 앱 UserDto(name, role, profileImage)로 매핑
  login: async (data: LoginInput): Promise<LoginResult> => {
    const sessionRes = await publicApi.post("/sessions", data);
    const { user_id, accessToken, refreshToken } = authPayloadSchema.parse(
      sessionRes.data,
    );

    const userRes = await publicApi.get(`/users/${user_id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const serverUser = serverUserSchema.parse(userRes.data);

    return {
      accessToken,
      refreshToken,
      user: {
        id: serverUser.id,
        email: serverUser.email,
        name: serverUser.full_name,
        role: serverUser.roles[0] ?? "PetOwner",
        profileImage: serverUser.photos[0]?.url ?? null,
      },
    };
  },

  // 회원가입: POST /users
  register: async (data: RegisterInput): Promise<void> => {
    await publicApi.post("/users", data);
  },

  // 로그아웃: DELETE /sessions (access_token 필요 → privateApi 사용)
  // privateApi는 순환 참조 방지를 위해 동적 import
  logout: async (): Promise<void> => {
    const { privateApi } = await import("./http/privateApi");
    await privateApi.delete("/sessions");
  },
};
