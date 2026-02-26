import { http } from '../api/axios-instance';

import { jobSchema, paginatedJobsSchema } from '../schemas/job.schema';

import type { CreateJobInput, Job, JobsQueryParams, PaginatedJobs, UpdateJobInput } from '../schemas/job.schema';

/**
 * GET /jobs — 구인공고 목록 조회 (필터/커서 페이지네이션)
 * GET /jobs/:id — 구인공고 상세 조회
 * POST /jobs — 구인공고 등록 (PetOwner 전용)
 * PUT /jobs/:id — 구인공고 수정 (작성자 또는 Admin)
 * DELETE /jobs/:id — 구인공고 삭제 (작성자 또는 Admin)
 */
export const jobService = {
  getJobs: (params?: JobsQueryParams): Promise<PaginatedJobs> =>
    http.get<PaginatedJobs>('/jobs', params, paginatedJobsSchema),

  getJob: (id: string): Promise<Job> =>
    http.get<Job>(`/jobs/${id}`, undefined, jobSchema),

  createJob: (data: CreateJobInput): Promise<Job> =>
    http.post<Job>('/jobs', data, jobSchema),

  updateJob: (id: string, data: UpdateJobInput): Promise<Job> =>
    http.put<Job>(`/jobs/${id}`, data, jobSchema),

  deleteJob: (id: string): Promise<Job> =>
    http.delete<Job>(`/jobs/${id}`, jobSchema),
};
