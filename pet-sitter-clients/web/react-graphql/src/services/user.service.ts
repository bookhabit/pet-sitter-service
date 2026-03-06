import { privateApi } from '../api/axios-instance';
import { http } from '../api/axios-instance';
import { jobListSchema } from '../schemas/job.schema';
import type { Job } from '../schemas/job.schema';
import { jobApplicationListSchema } from '../schemas/job-application.schema';
import type { JobApplication } from '../schemas/job-application.schema';
import type { CreateUserInput, UpdateUserInput, User } from '../schemas/user.schema';
import { userSchema } from '../schemas/user.schema';

/**
 * POST /users              — 회원가입 (인증 불필요)
 * GET  /users/:id          — 사용자 조회
 * PUT  /users/:id          — 사용자 정보 수정
 * DELETE /users/:id        — 사용자 삭제
 * GET  /users/:id/jobs     — 사용자가 등록한 공고 목록
 * GET  /users/:id/job-applications — 사용자가 지원한 공고 목록
 */
const signup = (data: CreateUserInput): Promise<User> =>
  http.auth.post<User>('/users', data, userSchema);

const getUser = (id: string): Promise<User> =>
  http.get<User>(`/users/${id}`, undefined, userSchema);

/** 로그인 직후 사용자 조회 — 인터셉터 없이 token 직접 주입 */
const getUserWithToken = (id: string, token: string): Promise<User> =>
  privateApi
    .get(`/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => userSchema.parse(res.data));

const updateUser = (id: string, data: UpdateUserInput): Promise<User> =>
  http.put<User>(`/users/${id}`, data, userSchema);

const deleteUser = (id: string): Promise<User> => http.delete<User>(`/users/${id}`, userSchema);

const getUserJobs = async (id: string): Promise<Job[]> => {
  const res = await http.get<{ items: Job[] }>(`/users/${id}/jobs`, undefined, jobListSchema);
  return res.items;
};

const getUserJobApplications = async (id: string): Promise<JobApplication[]> => {
  const res = await http.get<{ items: JobApplication[] }>(
    `/users/${id}/job-applications`,
    undefined,
    jobApplicationListSchema,
  );
  return res.items;
};

export const userService = {
  signup,
  getUser,
  getUserWithToken,
  updateUser,
  deleteUser,
  getUserJobs,
  getUserJobApplications,
};
