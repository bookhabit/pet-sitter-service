import { privateApi } from '../api/axios-instance';
import { http } from '../api/axios-instance';
import type { CreateUserInput, User } from '../schemas/user.schema';
import { userSchema } from '../schemas/user.schema';

/**
 * POST /users — 회원가입 (인증 불필요)
 * 응답: UserModel
 */
const signup = (data: CreateUserInput): Promise<User> =>
  http.auth.post<User>('/users', data, userSchema);

/**
 * GET /users/:id — 사용자 조회 (인증 필요)
 * 응답: UserModel
 */
const getUser = (id: string): Promise<User> =>
  http.get<User>(`/users/${id}`, undefined, userSchema);

/**
 * GET /users/:id — 로그인 직후 사용자 조회
 * 인터셉터를 거치지 않고 token을 직접 주입 (전역 store 변경 없이 호출 가능)
 */
const getUserWithToken = (id: string, token: string): Promise<User> =>
  privateApi
    .get(`/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => userSchema.parse(res.data));

export const userService = { signup, getUser, getUserWithToken };
