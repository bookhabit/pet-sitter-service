import { http } from '../api/axios-instance';

import {
  jobApplicationListSchema,
  jobApplicationSchema,
} from '../schemas/job-application.schema';

import type {
  JobApplication,
  JobApplicationList,
  UpdateJobApplicationInput,
} from '../schemas/job-application.schema';

/**
 * POST /jobs/:jobId/job-applications — 구인공고 지원 (PetSitter 전용)
 * GET  /jobs/:jobId/job-applications — 공고별 지원 목록 조회
 * PUT  /job-applications/:jobApplicationId — 지원 상태 수정 (공고 작성자만)
 */
export const jobApplicationService = {
  applyJob: (jobId: string): Promise<JobApplication> =>
    http.post<JobApplication>(`/jobs/${jobId}/job-applications`, undefined, jobApplicationSchema),

  getJobApplicationsByJob: (jobId: string): Promise<JobApplicationList> =>
    http.get<JobApplicationList>(`/jobs/${jobId}/job-applications`, undefined, jobApplicationListSchema),

  updateJobApplication: (
    jobApplicationId: string,
    data: UpdateJobApplicationInput,
  ): Promise<JobApplication> =>
    http.put<JobApplication>(`/job-applications/${jobApplicationId}`, data, jobApplicationSchema),
};
